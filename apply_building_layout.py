import sqlite3
import random
import math
import sys
import io

# Fix Unicode encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB_PATH = r"G:\Code\pw-asb-serverfarm\Data\Worlds\DuskMeridian\world.db"

def get_deepforge_hold_pattern():
    """
    Get the building layout pattern from Deepforge Hold (settlement_id = 28).
    Returns a list of relative positions from the settlement center.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get all buildings from Deepforge Hold
    cursor.execute("""
        SELECT building_id, name, type, x_coordinate, z_coordinate, y_coordinate
        FROM Buildings
        WHERE settlement_id = 28
        ORDER BY building_id
    """)

    buildings = cursor.fetchall()
    conn.close()

    if not buildings:
        print("❌ No buildings found in Deepforge Hold (settlement_id=28)")
        return []

    # Calculate center point
    x_coords = [b[3] for b in buildings]
    z_coords = [b[4] for b in buildings]

    center_x = sum(x_coords) / len(x_coords)
    center_z = sum(z_coords) / len(z_coords)

    print(f"📍 Deepforge Hold center: ({center_x:.2f}, {center_z:.2f})")
    print(f"📦 Buildings in pattern: {len(buildings)}")

    # Create pattern as relative offsets from center
    pattern = []
    for b in buildings:
        building_id, name, type_, x, z, y = b
        pattern.append({
            'type': type_,
            'name': name,
            'offset_x': x - center_x,
            'offset_z': z - center_z,
            'y': y  # Preserve Y coordinate (depth)
        })

    return pattern

def get_all_settlements_except_deepforge():
    """Get all settlement IDs except Deepforge Hold."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT settlement_id, name
        FROM Settlements
        WHERE settlement_id != 28
        ORDER BY settlement_id
    """)

    settlements = cursor.fetchall()
    conn.close()

    return settlements

def get_settlement_center(settlement_id):
    """Get the center coordinates of a settlement from the Settlements table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT x_coordinate, y_coordinate
        FROM Settlements
        WHERE settlement_id = ?
    """, (settlement_id,))

    result = cursor.fetchone()
    conn.close()

    if result:
        return result[0], result[1]  # x_coordinate, y_coordinate from Settlements
    return None, None

def apply_random_variance(value, variance_percent=5):
    """
    Apply random variance to a value.
    variance_percent: percentage of variance (e.g., 5 = ±5%)
    """
    variance = value * (variance_percent / 100.0)
    return value + random.uniform(-variance, variance)

def rotate_point(x, z, angle_degrees):
    """Rotate a point around origin by given angle in degrees."""
    angle_rad = math.radians(angle_degrees)
    new_x = x * math.cos(angle_rad) - z * math.sin(angle_rad)
    new_z = x * math.sin(angle_rad) + z * math.cos(angle_rad)
    return new_x, new_z

def apply_pattern_to_settlement(settlement_id, settlement_name, pattern,
                                variance_percent=10,
                                rotation_range=30,
                                scale_range=(0.8, 1.2),
                                dry_run=True):
    """
    Apply the Deepforge Hold pattern to a settlement with random variance.

    Args:
        settlement_id: ID of settlement to update
        settlement_name: Name of settlement (for logging)
        pattern: The building layout pattern from Deepforge Hold
        variance_percent: Percentage of random variance in position (default 10%)
        rotation_range: Random rotation in degrees ±range (default ±30°)
        scale_range: Random scale factor range (default 0.8 to 1.2)
        dry_run: If True, only print what would be done without updating DB
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get existing buildings for this settlement
    cursor.execute("""
        SELECT building_id, name, type, x_coordinate, z_coordinate, y_coordinate
        FROM Buildings
        WHERE settlement_id = ?
        ORDER BY building_id
    """, (settlement_id,))

    existing_buildings = cursor.fetchall()

    if not existing_buildings:
        print(f"⚠️  No buildings in settlement {settlement_id} ({settlement_name})")
        conn.close()
        return

    # Calculate center based on EXISTING building positions (not world coordinates)
    # This ensures buildings stay in their current area
    x_coords = [b[3] for b in existing_buildings]
    z_coords = [b[4] for b in existing_buildings]

    center_x = sum(x_coords) / len(x_coords)
    center_z = sum(z_coords) / len(z_coords)

    # Apply random transformations
    rotation = random.uniform(-rotation_range, rotation_range)
    scale = random.uniform(scale_range[0], scale_range[1])

    print(f"\n🏘️  {settlement_name} (ID: {settlement_id})")
    print(f"   Center: ({center_x:.2f}, {center_z:.2f})")
    print(f"   Buildings: {len(existing_buildings)}")
    print(f"   Rotation: {rotation:.1f}°, Scale: {scale:.2f}")

    updates = []

    # Match existing buildings to pattern positions
    for i, building in enumerate(existing_buildings):
        building_id, name, type_, old_x, old_z, old_y = building

        # Use pattern position (cycle if more buildings than pattern)
        pattern_idx = i % len(pattern)
        pattern_item = pattern[pattern_idx]

        # Apply transformations to pattern offset
        offset_x = pattern_item['offset_x'] * scale
        offset_z = pattern_item['offset_z'] * scale

        # Rotate
        offset_x, offset_z = rotate_point(offset_x, offset_z, rotation)

        # Apply variance
        offset_x = apply_random_variance(offset_x, variance_percent)
        offset_z = apply_random_variance(offset_z, variance_percent)

        # Calculate new position
        new_x = center_x + offset_x
        new_z = center_z + offset_z

        # Keep original Y (depth) with small variance
        new_y = apply_random_variance(old_y, variance_percent / 2)

        updates.append((new_x, new_z, new_y, building_id))

        if i < 3:  # Show first 3 buildings as example
            print(f"   Building {building_id} ({name}): ({old_x:.1f}, {old_z:.1f}) → ({new_x:.1f}, {new_z:.1f})")

    # Apply updates to database
    if not dry_run:
        cursor.executemany("""
            UPDATE Buildings
            SET x_coordinate = ?,
                z_coordinate = ?,
                y_coordinate = ?
            WHERE building_id = ?
        """, updates)

        conn.commit()
        print(f"   ✅ Updated {len(updates)} buildings")
    else:
        print(f"   🔍 DRY RUN - Would update {len(updates)} buildings")

    conn.close()

def main(dry_run=True):
    print("=" * 60)
    print("Building Layout Pattern Application")
    print("=" * 60)

    # Get the pattern from Deepforge Hold
    print("\n📋 Loading pattern from Deepforge Hold...")
    pattern = get_deepforge_hold_pattern()

    if not pattern:
        print("❌ Failed to load pattern")
        return

    # Get all settlements except Deepforge Hold
    settlements = get_all_settlements_except_deepforge()
    print(f"\n🏘️  Found {len(settlements)} settlements to update")

    # Show settings
    print("\n" + "=" * 60)
    print("SETTINGS:")
    print("  - Position variance: ±10%")
    print("  - Rotation range: ±30°")
    print("  - Scale range: 0.8x to 1.2x")
    print("  - Each settlement gets unique random transformation")
    print("=" * 60)

    if dry_run:
        print("\n🔍 DRY RUN MODE - No changes will be made to database\n")
    else:
        print("\n✅ LIVE MODE - Database will be updated\n")

    # Apply pattern to each settlement
    for settlement_id, settlement_name in settlements:
        apply_pattern_to_settlement(
            settlement_id=settlement_id,
            settlement_name=settlement_name,
            pattern=pattern,
            variance_percent=10,
            rotation_range=30,
            scale_range=(0.8, 1.2),
            dry_run=dry_run
        )

    print("\n" + "=" * 60)
    if dry_run:
        print("🔍 DRY RUN COMPLETE - No changes made")
        print("\nTo apply changes, run again and choose 'n' for dry run")
    else:
        print("✅ ALL SETTLEMENTS UPDATED")
        print(f"   Pattern from Deepforge Hold applied to {len(settlements)} settlements")
    print("=" * 60)

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Apply Deepforge Hold building layout to all settlements')
    parser.add_argument('--apply', action='store_true',
                       help='Apply changes to database (default is dry-run mode)')

    args = parser.parse_args()

    main(dry_run=not args.apply)

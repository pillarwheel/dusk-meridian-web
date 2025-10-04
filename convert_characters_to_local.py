import sqlite3
import sys
import io

# Fix Unicode encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB_PATH = r"G:\Code\pw-asb-serverfarm\Data\Worlds\DuskMeridian\world.db"

# Target local coordinates (matching buildings)
TARGET_CENTER_X = 1250.0
TARGET_CENTER_Z = -15.0

def convert_settlement_characters(settlement_id, settlement_name, dry_run=True):
    """Convert character locations to local coordinates for a settlement."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get characters in this settlement from CharacterLocations
    cursor.execute("""
        SELECT character_id, x_coordinate, y_coordinate, z_coordinate, building_id
        FROM CharacterLocations
        WHERE settlement_id = ?
    """, (settlement_id,))

    characters = cursor.fetchall()

    if not characters:
        print(f"⚠️  No characters in settlement {settlement_id} ({settlement_name})")
        conn.close()
        return

    # Calculate current center of outdoor characters
    outdoor_chars = [c for c in characters if c[4] is None or c[4] == 0]

    if not outdoor_chars:
        print(f"⚠️  No outdoor characters in settlement {settlement_id} ({settlement_name})")
        conn.close()
        return

    x_coords = [c[1] for c in outdoor_chars if c[1] is not None]
    z_coords = [c[3] for c in outdoor_chars if c[3] is not None]

    if not x_coords or not z_coords:
        print(f"⚠️  Characters have NULL coordinates in settlement {settlement_id}")
        conn.close()
        return

    current_center_x = sum(x_coords) / len(x_coords)
    current_center_z = sum(z_coords) / len(z_coords)

    offset_x = TARGET_CENTER_X - current_center_x
    offset_z = TARGET_CENTER_Z - current_center_z

    print(f"\n🏘️  {settlement_name} (ID: {settlement_id})")
    print(f"   Current center: ({current_center_x:.2f}, {current_center_z:.2f})")
    print(f"   Target center: ({TARGET_CENTER_X:.2f}, {TARGET_CENTER_Z:.2f})")
    print(f"   Offset: ({offset_x:.2f}, {offset_z:.2f})")
    print(f"   Total characters: {len(characters)}, Outdoor: {len(outdoor_chars)}")

    updates = []

    for char in characters:
        char_id, old_x, old_y, old_z, building_id = char

        if old_x is None or old_z is None:
            continue

        # Apply offset
        new_x = old_x + offset_x
        new_z = old_z + offset_z
        new_y = old_y  # Keep Y (height) the same

        updates.append((new_x, new_y, new_z, char_id, settlement_id))

    # Show sample
    if len(updates) > 0 and len(outdoor_chars) > 0:
        first_outdoor = outdoor_chars[0]
        print(f"   Sample outdoor char {first_outdoor[0]}: ({first_outdoor[1]:.1f}, {first_outdoor[3]:.1f}) → ({first_outdoor[1] + offset_x:.1f}, {first_outdoor[3] + offset_z:.1f})")

    # Apply updates
    if not dry_run:
        cursor.executemany("""
            UPDATE CharacterLocations
            SET x_coordinate = ?,
                y_coordinate = ?,
                z_coordinate = ?
            WHERE character_id = ? AND settlement_id = ?
        """, updates)

        conn.commit()
        print(f"   ✅ Updated {len(updates)} characters")
    else:
        print(f"   🔍 DRY RUN - Would update {len(updates)} characters")

    conn.close()

def get_all_settlements():
    """Get all settlements."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT settlement_id, name
        FROM Settlements
        ORDER BY settlement_id
    """)

    settlements = cursor.fetchall()
    conn.close()

    return settlements

def main(dry_run=True):
    print("=" * 60)
    print("Convert Character Locations to Local Coordinates")
    print("=" * 60)
    print("\nThis will center character positions around Unity local space")
    print("Target: X=1250, Z=-15 (matching buildings)")
    print("=" * 60)

    settlements = get_all_settlements()
    print(f"\n🏘️  Found {len(settlements)} settlements to process")

    if dry_run:
        print("\n🔍 DRY RUN MODE - No changes will be made to database\n")
    else:
        print("\n✅ LIVE MODE - Database will be updated\n")

    updated_count = 0
    for settlement_id, settlement_name in settlements:
        convert_settlement_characters(settlement_id, settlement_name, dry_run)
        updated_count += 1

    print("\n" + "=" * 60)
    if dry_run:
        print("🔍 DRY RUN COMPLETE - No changes made")
        print("\nTo apply changes, run: python convert_characters_to_local.py --apply")
    else:
        print("✅ ALL CHARACTER LOCATIONS CONVERTED")
        print(f"   Processed {updated_count} settlements")
    print("=" * 60)

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Convert character locations to local Unity coordinates')
    parser.add_argument('--apply', action='store_true',
                       help='Apply changes to database (default is dry-run mode)')

    args = parser.parse_args()

    main(dry_run=not args.apply)

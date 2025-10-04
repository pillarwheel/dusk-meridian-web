import sqlite3
import sys
import io

# Fix Unicode encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB_PATH = r"G:\Code\pw-asb-serverfarm\Data\Worlds\DuskMeridian\world.db"

def convert_settlement_to_local_coords(settlement_id, settlement_name, dry_run=True):
    """
    Convert a settlement's buildings from world coordinates to local coordinates.
    Local coordinates are centered around (0, 0) with buildings arranged nearby.
    This matches Unity's local space for settlements.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get all buildings for this settlement
    cursor.execute("""
        SELECT building_id, name, type, x_coordinate, z_coordinate, y_coordinate
        FROM Buildings
        WHERE settlement_id = ?
        ORDER BY building_id
    """, (settlement_id,))

    buildings = cursor.fetchall()

    if not buildings:
        print(f"⚠️  No buildings in settlement {settlement_id} ({settlement_name})")
        conn.close()
        return

    # Calculate current center
    x_coords = [b[3] for b in buildings]
    z_coords = [b[4] for b in buildings]

    current_center_x = sum(x_coords) / len(x_coords)
    current_center_z = sum(z_coords) / len(z_coords)

    # Target center for local coordinates (like Deepforge Hold)
    # Deepforge Hold is centered around X=1250, Z=-15
    target_center_x = 1250.0
    target_center_z = -15.0

    offset_x = target_center_x - current_center_x
    offset_z = target_center_z - current_center_z

    print(f"\n🏘️  {settlement_name} (ID: {settlement_id})")
    print(f"   Current center: ({current_center_x:.2f}, {current_center_z:.2f})")
    print(f"   Target center: ({target_center_x:.2f}, {target_center_z:.2f})")
    print(f"   Offset: ({offset_x:.2f}, {offset_z:.2f})")
    print(f"   Buildings: {len(buildings)}")

    updates = []

    for building in buildings:
        building_id, name, type_, old_x, old_z, old_y = building

        # Apply offset to center around target
        new_x = old_x + offset_x
        new_z = old_z + offset_z
        new_y = old_y  # Keep Y (height) the same

        updates.append((new_x, new_z, new_y, building_id))

    # Show sample
    if len(updates) > 0:
        print(f"   Sample: {buildings[0][1]} ({buildings[0][3]:.1f}, {buildings[0][4]:.1f}) → ({updates[0][0]:.1f}, {updates[0][1]:.1f})")

    # Apply updates
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
    print("Convert All Settlements to Local Coordinates")
    print("=" * 60)
    print("\nThis will center all settlements around Unity local space")
    print("Target: X=1250, Z=-15 (matching Deepforge Hold)")
    print("=" * 60)

    settlements = get_all_settlements()
    print(f"\n🏘️  Found {len(settlements)} settlements to convert")

    if dry_run:
        print("\n🔍 DRY RUN MODE - No changes will be made to database\n")
    else:
        print("\n✅ LIVE MODE - Database will be updated\n")

    for settlement_id, settlement_name in settlements:
        convert_settlement_to_local_coords(settlement_id, settlement_name, dry_run)

    print("\n" + "=" * 60)
    if dry_run:
        print("🔍 DRY RUN COMPLETE - No changes made")
        print("\nTo apply changes, run: python convert_to_local_coords.py --apply")
    else:
        print("✅ ALL SETTLEMENTS CONVERTED TO LOCAL COORDINATES")
        print(f"   All {len(settlements)} settlements now centered around (1250, -15)")
    print("=" * 60)

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Convert all settlements to local Unity coordinates')
    parser.add_argument('--apply', action='store_true',
                       help='Apply changes to database (default is dry-run mode)')

    args = parser.parse_args()

    main(dry_run=not args.apply)

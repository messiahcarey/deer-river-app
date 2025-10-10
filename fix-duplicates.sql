-- Fix duplicate faction memberships
-- This script will mark older duplicate memberships as leftAt with a timestamp

-- First, let's see what duplicates exist
SELECT 
    p.name as person_name,
    f.name as faction_name,
    COUNT(*) as membership_count,
    STRING_AGG(pfm.id::text, ', ') as membership_ids
FROM person_faction_membership pfm
JOIN person p ON pfm.person_id = p.id
JOIN faction f ON pfm.faction_id = f.id
WHERE pfm.left_at IS NULL
GROUP BY p.id, p.name, f.id, f.name
HAVING COUNT(*) > 1
ORDER BY p.name, f.name;

-- Now fix the duplicates by keeping the most recent membership and marking others as left
WITH duplicates AS (
    SELECT 
        pfm.id,
        pfm.person_id,
        pfm.faction_id,
        p.name as person_name,
        f.name as faction_name,
        ROW_NUMBER() OVER (
            PARTITION BY pfm.person_id, pfm.faction_id 
            ORDER BY pfm.id DESC
        ) as rn
    FROM person_faction_membership pfm
    JOIN person p ON pfm.person_id = p.id
    JOIN faction f ON pfm.faction_id = f.id
    WHERE pfm.left_at IS NULL
)
UPDATE person_faction_membership 
SET 
    left_at = NOW(),
    notes = COALESCE(notes, '') || ' (Removed duplicate)'
WHERE id IN (
    SELECT id 
    FROM duplicates 
    WHERE rn > 1
);

-- Verify the fix
SELECT 
    p.name as person_name,
    f.name as faction_name,
    COUNT(*) as membership_count
FROM person_faction_membership pfm
JOIN person p ON pfm.person_id = p.id
JOIN faction f ON pfm.faction_id = f.id
WHERE pfm.left_at IS NULL
GROUP BY p.id, p.name, f.id, f.name
HAVING COUNT(*) > 1
ORDER BY p.name, f.name;

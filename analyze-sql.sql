-- Let's analyze what this SQL does step by step

-- First, let's see what the CTE (Common Table Expression) does:
WITH duplicates AS (
    SELECT 
        pfm.id,
        pfm.person_id,
        pfm.faction_id,
        ROW_NUMBER() OVER (
            PARTITION BY pfm.person_id, pfm.faction_id 
            ORDER BY pfm.id DESC
        ) as rn
    FROM person_faction_membership pfm
    WHERE pfm.left_at IS NULL
)
SELECT * FROM duplicates ORDER BY person_id, faction_id, rn;

-- This CTE:
-- 1. PARTITION BY pfm.person_id, pfm.faction_id - Groups by person AND faction
-- 2. ORDER BY pfm.id DESC - Orders by ID descending (newest first)
-- 3. ROW_NUMBER() - Assigns row numbers within each partition
-- 4. rn > 1 - Only affects rows where there are MULTIPLE memberships for the SAME person-faction combination

-- So if Cenra Vallis has:
-- - 1 "Original Residents" membership (ID: 100)
-- - 1 "Original Residents" membership (ID: 200) 
-- - 1 "Town Guard" membership (ID: 300)
-- - 1 "Merchants" membership (ID: 400)

-- The CTE would produce:
-- person_id | faction_id | id | rn
-- cenra_id  | original_id| 200| 1  (newest Original Residents)
-- cenra_id  | original_id| 100| 2  (older Original Residents) 
-- cenra_id  | guard_id   | 300| 1  (only Town Guard membership)
-- cenra_id  | merchant_id| 400| 1  (only Merchants membership)

-- The WHERE rn > 1 condition means:
-- - rn = 1: Keep this membership (newest or only one)
-- - rn > 1: Mark as left (duplicates only)

-- So it would ONLY affect the duplicate "Original Residents" membership (ID: 100)
-- It would NOT touch the "Town Guard" or "Merchants" memberships

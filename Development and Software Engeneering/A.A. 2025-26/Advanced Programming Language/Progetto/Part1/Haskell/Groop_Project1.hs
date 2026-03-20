
-- PART 1: Functions
-- Interleave
interleave :: [a] -> [a] -> [a]
interleave [] ys = ys
interleave xs [] = xs
interleave (x:xs) (y:ys) = x : y : interleave xs ys

-- Chunks
chunks :: Int -> [a] -> [[a]]
chunks n _ | n <=0 = []
chunks _ [] = []
chunks n xs = mytake n xs : chunks n (mydrop n xs)
    where
        -- custimuzation of take and drop functions
        mytake _ [] = []
        mytake k (x:xs) | k > 0 = x : mytake (k-1) xs
                | otherwise = []

        mydrop _ [] = []
        mydrop k list@(x:xs) | k > 0 = mydrop (k-1) xs
                    | otherwise = []

-- Rotate
rotate :: Int -> [a] -> [a]
rotate _ [] = []
--union of the two list in the opposite order
rotate n xs = mydropRotate m xs ++ mytakeRotate m xs
    where
        m = n `mod` length xs
        -- custimuzation of take and drop functions
        mytakeRotate _ [] = []
        mytakeRotate k (x:xs) | k > 0 = x : mytakeRotate (k-1) xs
                | otherwise = []

        mydropRotate _ [] = []
        mydropRotate k list@(x:xs) | k > 0 = mydropRotate (k-1) xs
                    | otherwise = list

-- Frequencies
frequencies :: Eq a => [a] -> [(a, Int)]
frequencies xs = helpFrequencies xs []
    where
        --takes the list and a counter
        helpFrequencies [] count = count
        helperFrequencies (x:xs) count = helperFrequencies xs (updateCount x count)
        --updates the count of the element in the list and the current counter
        updateCount item [] = [(item, 1)]
        updateCount item ((k, v):rest)
            | item == k = (k, v + 1) : rest
            | otherwise = (k, v) : updateCount item rest


-- Part 3: Cesar Cipher
-- 1. ENCODE
cesar :: Int -> String -> String
cesar _ [] = []
cesar n (c:cs) = shiftChar n c : cesar n cs

shiftChar :: Int -> Char -> Char
shiftChar n c
    | 'a' <= c && c <= 'z' = rotateChar 'a' n c
    | 'A' <= c && c <= 'Z' = rotateChar 'A' n c
    | otherwise = c
  where
    rotateChar base n c = 
        let ordC = fromEnum c - fromEnum base
            effN = (ordC + n) `mod` 26
        in toEnum (fromEnum base + effN)

-- 2. CRACK
crack :: String -> String
crack text = cesar (findBest 0 0 (-1)) text
  where
    
    findBest s bestS maxVal
        | s > 25 = bestS
        | otherwise = 
            let currentScore = countCharE (cesar s text)
            in if currentScore > maxVal 
               then findBest (s + 1) s currentScore
               else findBest (s + 1) bestS maxVal

    
    countCharE [] = 0
    countCharE (x:xs)
        | x == 'e' || x == 'E' = 1 + countCharE xs
        | otherwise = countCharE xs
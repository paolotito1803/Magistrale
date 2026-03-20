
-- PART 1: Functions
-- Interleave
interleave :: [a] -> [a] -> [a]
interleave [] ys = ys
interleave xs [] = xs
interleave (x:xs) (y:ys) = x : y : interleave xs ys

-- Chunks
chunks :: Int -> [a] -> [[a]]
chunks n _ | n <=0 = []
chunks n _ [] = []
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
cesar :: Int -> String -> String
    cesar n text = map(shiftChar n) text

    shiftChar :: Int -> Char -> Char
        shiftChar n c
            | 'a' <= c && c <= 'z' = rotateChar n 'a' n c
            | 'A' <= c && c <= 'Z' = rotateChar n 'A' n c
            | otherwise = c
        where
            rotateChar base n c =
                let ordC = fromEnum c - fromEnum base
                effN = (ordC + n) `mod` 26
                in toEnum (effN + base)

    -- Crack
    crack :: String -> String
    crack text = cesar(bestShift text) text

    bestShift :: String -> Int
    bestShift text = findIndex [countChar 'e' (cesar n text) | s <- [0..25]]
    
    couterChar :: Char -> String -> Int
    countChar c text = length [x | x <- text, x == c]

    dinfMaxIndex :: [Int] -> Int
    findMaxIndex xs = head [i| (x, i) <- zip xs [0..], x == maximum xs]
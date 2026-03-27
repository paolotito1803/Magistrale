
-- PART 1: Functions
-- Interleave
interleave :: [a] -> [a] -> [a]
interleave [] ys = ys
interleave xs [] = xs
interleave (x:xs) (y:ys) = x : y : interleave xs ys

-- Chunks
chunks :: Int -> [a] -> [[a]]
chunks n _ | n <= 0 = []
chunks _ [] = []
chunks n xs = mytake n xs : chunks n (mydrop n xs)
    where
        -- customization of take and drop functions
        mytake _ [] = []
        mytake k (x:xs) | k > 0 = x : mytake (k-1) xs
                | otherwise = []

        mydrop _ [] = []
        mydrop k list@(x:xs) | k > 0 = mydrop (k-1) xs
                    | otherwise = list

-- Rotate
rotate :: Int -> [a] -> [a]
rotate _ [] = []
--union of the two list in the opposite order
rotate n xs = mydropRotate m xs ++ mytakeRotate m xs
    where
        m = n `mod` length xs
        -- customization of take and drop functions
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
        helpFrequencies (x:xs) count = helpFrequencies xs (updateCount x count)
        --updates the count of the element in the list and the current counter
        updateCount item [] = [(item, 1)]
        updateCount item ((k, v):rest)
            | item == k = (k, v + 1) : rest
            | otherwise = (k, v) : updateCount item rest



-- PART 2: Types Under the Microscope

-- 2.1:

-- Here for ':type interleave2_1' the type inferred is 'interleave2_1 :: [a] -> [a] -> [a]'
interleave2_1 [] ys = ys
interleave2_1 xs[] = xs
interleave2_1 (x:xs) (y:ys) = x : y : interleave2_1 xs ys

-- Here for ':type frequencies2_1' the type inferred is 'frequencies2_1 :: (Num b, Eq t) => [t] -> [(t, b)]'
-- This is different from what we had written "frequencies :: Eq a => [a] -> [(a, Int)]":
-- - Int becomes 'Num b', as ghci infers the most general type.
-- - Eq t matches Eq a, just with a different variable name, as it comes from the updateCount == comparison.
frequencies2_1 xs = helpFrequencies2_1 xs []
    where
        helpFrequencies2_1[] count = count
        helpFrequencies2_1 (x:xs) count = helpFrequencies2_1 xs (updateCount2_1 x count)
        
        updateCount2_1 item [] = [(item, 1)]
        updateCount2_1 item ((k, v):rest)
            | item == k = (k, v + 1) : rest
            | otherwise = (k, v) : updateCount2_1 item rest



-- PART 3: Mini Project
-- Caesar Cipher
-- Encode
head' :: [a] -> a
head' (x:xs) = x


shiftn :: Int -> Char -> Char
shiftn n 'a' = head' $ rotate n ['a'..'z']
shiftn n 'z' = head' $ rotate n $ 'z':['a'..'y']
shiftn n c | c >= 'a' && c <= 'z' = head' $ rotate n $ [c..'z']++['a'..c]
shiftn n 'A' = head' $ rotate n ['A'..'Z']
shiftn n 'Z' = head' $ rotate n $ 'Z':['A'..'Y']
shiftn n c | c >= 'A' && c <= 'Z' = head' $ rotate n $ [c..'Z']++['A'..c]

encode :: Int -> String -> String
encode _ "" = ""
encode n (c:cs)
          | c >= 'a' && c <= 'z' = shiftn (mod n 26) c:encode n cs
          | c >= 'A' && c <= 'Z' = shiftn (mod n 26) c:encode n cs
          | otherwise            = c:encode n cs

-- Decode
decode :: Int -> String -> String
decode _ "" = ""
decode n s = encode (0-n) s

-- Crack cipher
maxFreq :: [(Char, Int)] -> Char
maxFreq ((x,x'):xs) = max' (x,x') xs
  where
    max' (x,x') [] = x
    max' (x,x') ((y,y'):ys)
      | x' < y'   = max' (y,y') ys
      | otherwise = max' (x,x') ys

filter' :: (a -> Bool) -> [a] -> [a]
filter' _ [] = []
filter' f (x:xs) = if f x then x:filter' f xs else filter' f xs

map' :: (a -> b) -> [a] -> [b]
map' _ [] = []
map' f (x:xs) = f x:map' f xs

fst' :: (a,b) -> a
fst' (a,b) = a

myelem :: Char -> [Char] -> Bool
myelem _ [] = False
myelem c (x:xs) = if c == x then True else myelem c xs

crackCipher :: String -> Int
crackCipher "" = 0
crackCipher s = fst'
                $ head' 
                $ filter' (\(x,y) -> (y == 'e' || y == 'E'))
                $ map' (\(x,y) -> (x, maxFreq y))
                $ map' (\(x,y) -> (x, frequencies y)) 
                $ map' (\(x,y) -> (x, filter' (\z -> myelem z $ ['a'..'z']++['A'..'Z']) y)) 
                $ map' (\x -> (x, decode x s)) [0..25]
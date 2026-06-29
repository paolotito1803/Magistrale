-- Ex1
countAbove :: Int -> [Int] -> Int
countAbove _ [] = 0
countAbove t (x:xs) = if t > x then 1 + countAbove t xs
                        else countAbove t xs

longestRunAbove :: Int -> [Int] -> Int
longestRunAbove _ [] = 0
longestRunAbove t (x:xs) = helper (x:xsx) 0 0

helper :: [Int] -> Int -> Int -> Int
helper [] max pos = if pos > max then pos else max
helper (x:xs) max pos = if x > t then helper xs max (pos + 1) else if pos > max then helper xs pos 0

-- ex2
--a alpha perchè dipende dal tipo di ritonro di f e da cosa accetta in input, beta per motivo analogo
--b
double_sum = sum . map (* 2)
-- c
peakSqares :: Int -> [Int] -> [Int]
peakSqares t = map ( ^ 2) . filter ( > t)

--ex3
module SortedRun (SortedRun, singleton, toList, extended) where
    data SortedRun a = MkSortedRun [a]

    singleton :: a -> SortedRun a
    singleton x = MkSortedRun [x]

    toList :: SortedRun a -> [a]
    toList (MkSortedRun xs) = reverse xs

    extended :: Ord a => SortedRun a -> a -> Maybe (SortedRun a)
    extended (MkSortedRun []) x =  MkSortedRun [x] 
    extended (MkSortedRun (x:xs)) y = if x <= y then MkSortedRun (y : x : xs) else Nothing

--ex5
class Mergeable a where
    merge :: a -> a -> a

instance Mergeable Int where
    merge :: Int -> Int -> Int
    merge x y = x + y

mergeAll :: mergeable a => a -> [a] -> a
mergeAll x [] = x
mergeAll x (y:ys) = mergeAll (merge x y) ys
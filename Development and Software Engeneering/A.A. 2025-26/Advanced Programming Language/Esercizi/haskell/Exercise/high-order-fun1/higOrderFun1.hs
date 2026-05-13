myfoldr :: (a->b->b)->b->[a]->b
myfoldr f z [] = z
myfoldr f b (x:xs) = f x (myfoldr f b xs)

mySum :: [Int] -> Int
mySum = myfoldr (+) 0

myProduct :: [Int] -> Int
myProduct = myfoldr (*) 1

myLength :: [a] -> Int
myLength = myfoldr (\_ acc -> 1 + acc) 0

myConcat :: [[a]] -> [a]
myConcat = myfoldr (++) []

myAny :: (a -> Bool) -> [a] -> Bool
myAny p = myfoldr (\x acc -> if p x then True else acc) False

myAll :: (a -> Bool) -> [a] -> Bool
myAll p = myfoldr (\x acc -> if p x then acc else False) True

myTakeWhile :: (a -> Bool) -> [a] -> [a]
myTakeWhile p = myfoldr (\x acc -> if p x then x : acc else []) []

pipe :: [a -> a] -> a -> a
pipe fs x = myfoldr (\f acc -> f acc) x fs

pipeL :: [a -> a] -> a -> a
pipeL = myfoldr (flip (.)) id


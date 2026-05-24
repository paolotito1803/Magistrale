myfoldr :: (a->b->b)->b->[a]->b
myfoldr f b [] = b
myfoldr f b (x:xs) = f x (myfoldr f b xs)

mySum :: [Int] -> Int
mySum = myfoldr (+) 0

mySum = myfoldr (+) 0

myProduct :: [Int] -> Int
myProduct = myfoldr (*) 1

myProduct = myFoldr (*) 1

myLength :: [a] -> Int
myLength = myfoldr (\_ count -> count + 1) 0

myLength = foldr(\_ n -> n + 1) 0

myConcat :: [[a]] -> [a]
myConcat = myfoldr (++) []

myAny :: (a -> Bool) -> [a] -> Bool
myAny p = myfoldr (\x acc -> p x || acc) False

myAny :: (a -> Bool) -> [a] -> Bool
myAny p = myfoldr (\x xs -> p x || xs) false

myAll :: (a -> Bool) -> [a] -> Bool
myAll p = myfoldr(\x xs -> p x && xs) True

myTakeWhile :: (a -> Bool) -> [a] -> [a]
myTakeWhile p = myfoldr(\x acc -> if p x then x : acc else []) []

pipe :: [a -> a] -> a -> a
pipe = myfoldr (.) id

pipeL :: [a->a] -> a -> a
pipeL = foldl (flip (.)) id


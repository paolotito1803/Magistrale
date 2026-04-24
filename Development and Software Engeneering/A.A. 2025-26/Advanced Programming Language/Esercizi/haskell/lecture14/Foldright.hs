myfoldr :: (a -> b -> b) -> b -> [a] -> b
myfoldr f b []     = b
myfoldr f b (a:as) = f a (myfoldr f b as)

mysum :: [Int] -> Int
mysum = myfoldr (+) 0

myProduct :: [Int] -> Int
myProduct = myfoldr (*) 1

myLength :: [a] -> Int
myLength = myfoldr (\_ n -> n + 1) 0

myConcat :: [[a]] -> [a]
myConcat = myfoldr (\x y -> x ++ y) []

ex1 = foldr(\x acc -> "(" ++ x ++ "+" ++ acc ++ ")") "0" ["a", "b", "c"] -- "(a+(b+(c+0)))"
ex2 = foldl (\acc x -> "(" ++ acc ++ "+" ++ x ++ ")") "0" ["a", "b", "c"] -- "(((0+a)+b)+c)"

myAny :: (a -> Bool) -> [a] -> Bool
myAny p = myfoldr (\x xs -> p x || xs) False

myAll :: (a -> Bool) -> [a] -> Bool
myAll p = myfoldr (\x xs -> p x && xs) True

myTakeWhile :: (a -> Bool) -> [a] -> [a]
myTakeWhile p = myfoldr (\x xs -> if p x then x:xs else []) []

mypipe :: [a -> a] -> a -> a
mypipe = myfoldr 
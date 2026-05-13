negateAll  :: [Int] -> [Int]
negateAll [] = []
negateAll (x:xs) = (-x) : negateAll xs
negateAll l = map(\x -> -x) l

longWords :: [String] -> [String]
longWords [] = []
longWords = filter((> 4) . length) -- same as filter(\s -> length s > 4)
longWords = filter(\s -> length s > 4)

countEven :: [Int] -> Int
countEven [] = 0
countEven = length . (filter even)

myflip :: (a -> b -> c) -> (b -> a -> c)
myflip f x y = f y x

prepend :: [a] -> a -> [a]
prepend xs x = x : xs

reverse :: [a] -> [a]
reverse = foldl (flip (:)) []

lift ::  (b -> b -> b) -> (a -> b) -> (a -> b) -> (a -> b)
lift op f g = \x -> op (f x) (g x)

adder :: (Double -> Double) -> (Double -> Double) -> (Double-> Double)
adder = lift (+)

multiplier :: (Double -> Double) -> (Double -> Double) -> (Double-> Double)
multiplier = lift (*)

meet :: (Int -> Bool) -> (Int -> Bool) -> (Int -> Bool)
meet = lift (&&)

liftAll :: (b -> b -> b) -> b -> [a -> b] -> (a -> b)
liftAll op x f = foldr (lift op) x f

meetAll :: [Int -> Bool] -> (Int -> Bool)
meetAll = liftAll (&&) True


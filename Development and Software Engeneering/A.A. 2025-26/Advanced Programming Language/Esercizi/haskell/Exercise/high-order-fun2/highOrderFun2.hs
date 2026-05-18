negateAll :: [Int] -> [Int]
negateAll = map negate

longWords :: [String] -> [String]
longWords = filter ((> 4) . length)

countEven :: [Int] -> Int
countEven = length . (filter even)

myflip :: (a -> b -> c) -> b -> a -> c
myflip f x y = f y x

prepend :: [a] -> a -> [a]
prepend xs x = myflip (++) [x] xs

reverse :: [a] -> [a]
reverse = foldl (flip (:)) []

mylift :: (b -> b -> b) -> (a -> b) -> (a -> b) -> (a -> b)
mylift op f g = \x -> op ( f x) (g x)

adder :: (Double -> Double) -> (Double -> Double) -> (Double -> Double)
adder f g = mylift (+) f g

multiplier :: (Double -> Double) -> (Double -> Double) -> (Double -> Double)
multiplier f g = mylift (*) f g

divider :: (Double -> Double) -> (Double -> Double) -> (Double -> Double)
divider f g = mylift (/) f g

meet :: (Int -> Bool) -> (Int -> Bool) -> (Int -> Bool)
meet = lift (&&)

liftAll :: (b -> b -> b) -> (a -> b) -> [a -> b] -> (a -> b)
liftAll op xs f = foldr (lift (op)) xs f

meetAll :: [Int -> Bool] -> (Int -> Bool)
meetAll = liftAll (&&) (const True)
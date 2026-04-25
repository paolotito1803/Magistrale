negateAll :: [Int] -> [Int]
negateAll = map (* (-1))

longWords :: [String] -> [String]
longWords = filter((> 4) . length)

countEven :: [Int] -> Int
countEven = length.filter even

myflip :: (a -> b -> c) -> b -> a -> c
myflip f x y = f y x

prepend :: [a] -> a -> [a]
prepend xs x = flip (++) xs [x]

myreverse :: [a] -> [a]
myreverse = foldl(myflip(:)) [] -- prima esegue : poi flip e poi foldl (ricompone tutto partendo dal caso base)
--myreverse = foldl(\x y -> y ++[x]) []
--myreverse = foldl(myflip(\x y -> [x] ++ y)) []

lift :: (b->b->b) -> (a->b)->(a->b)->(a->b)
lift op f g x = op (f x) (g x)

mylift :: (b->b->b) -> (a->b)->(a->b)->(a->b)
mylift op f g = \x -> op (f x) (g x)

-- Funzioni di supporto per fare un test leggibile
raddoppia :: Int -> Int
raddoppia x = x * 2

aggiungiDieci :: Int -> Int
aggiungiDieci x = x + 10

adder :: (Int -> Double) -> (Int -> Double) -> (Int -> Double)
adder f g = lift (+) f g

multiplier :: (Int -> Double) -> (Int -> Double) -> (Int -> Double)
multiplier f g = lift (*) f g

meet :: (Int-> Bool) -> (Int-> Bool) -> (Int-> Bool)
meet f g = lift (&&) f g

liftAll :: (b->b->b) ->b->[a->b]->(a->b)
liftAll op a listf = \x -> foldr op a (map (\f -> f x) listf)

meetAll :: [Int-> Bool] -> (Int-> Bool)
meetAll = liftAll (&&) True

type church a = (a -> a) -> a -> a
zero :: church a
zero = \f x -> x
one :: church a
one = \f x -> f x
two :: church a
two = \f x -> f (f x)
three :: church a
three = \f x -> f (f (f x))

toInt :: church Int -> Int
toInt m = m (+1) 0

fromInt :: Int -> church a
fromInt 0 = zero
fromInt n = \f x -> f (fromInt (n - 1) f x)

churchAdd :: church a -> church a -> church a
churchAdd m n = \f x -> m f(n f x)

churchMul :: church a -> church a -> church a
churchMul m n = \f y -> m (\x -> n f x) y
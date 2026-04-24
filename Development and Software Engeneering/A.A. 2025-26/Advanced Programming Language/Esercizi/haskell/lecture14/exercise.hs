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
myreverse = foldl(\x y -> y ++[x]) []
myreverse = foldl(myflip(\x y -> [x] ++ y)) []

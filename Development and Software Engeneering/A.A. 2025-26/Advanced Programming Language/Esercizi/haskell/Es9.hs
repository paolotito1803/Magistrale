module Es9 where
myZipWith :: (Int -> Int -> Int) -> [Int] -> [Int] -> [Int] 
myZipWith f f [] _ = []
myZipWith f _ []  = []
myZipWith f (x:xs) (y:ys) = f x y : myZipWith f xs ys

myZipWith :: (Int -> Int -> Int) -> [Int] -> [Int] -> [Int]
myZipWith f [] [] = []
myZipWith f [] _ = []
myZipWith f _ [] = []
myZipWith f (x:xs) (y:ys) = f x y : myZipWith f xs ys
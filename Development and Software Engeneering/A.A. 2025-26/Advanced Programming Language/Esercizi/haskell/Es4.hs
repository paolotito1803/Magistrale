module Es4 where
triple:: Int -> Int
addTen:: Int-> Int
isEven:: Int -> Bool
   -- triple 5     =>  15-- addTen 7     =>  17-- isEven 4     =>  True-- isEven 7     =>  False-- multiplies by 3-- adds 10-- checks if even (hint: mod)
    triple = (* 3)
    addTen = (+ 10)
    isEven (== 0) . (mod 2)

    triple :: Int -> Int
    triple (* 3)
    addTen :: Int -> Int
    addTen (+ 10)
    isEven :: Int -> Bool
    isEven (== 0) . (mod 2)
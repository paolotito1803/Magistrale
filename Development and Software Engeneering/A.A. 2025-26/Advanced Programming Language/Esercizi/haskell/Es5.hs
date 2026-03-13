module Es5 where
fib:: Int-> Int
fib 0 = 0
fib 1 = 1
fib n = fib (n-1) + fib (n-2)

fibFast :: Int -> Int
fibFast n = go n 0 1 
where 
    go :: Int -> Int -> Int -> Int 
    go 0 a b = a
    go n a b = go (n-1) b (a+b) 
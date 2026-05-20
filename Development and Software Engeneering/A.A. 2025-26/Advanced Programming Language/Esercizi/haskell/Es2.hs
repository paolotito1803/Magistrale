module Es2 where
countdown: Int -> [Int]
countdown 0 = []
countdown n = n : countdown (n-1)

countdown :: Int -> [Int]
countdown 0 = []
countdown n = n : countdown (n-1)
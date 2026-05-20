module Es7 where
pairs :: Int -> [(Int, Int)] 
pairs n = [(x, y) | x <- [1..n], y <- [x+1..n]]

pairs' :: Int -> [(Int, Int)]
pairs' 0 = []
pairs' n = [(x, y) | x <- [1..n], y <- [x+1..n]]
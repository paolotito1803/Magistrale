module Es10 where
challenge:: [Int] -> Int
challenge = sum . map (^2) . filter odd

challenge :: [Int] -> Int
challenge n = sum . (map (^2) . (filter odd $ n))
module Es10 where
challenge:: [Int] -> Int
challenge = sum . map (^2) . filter odd
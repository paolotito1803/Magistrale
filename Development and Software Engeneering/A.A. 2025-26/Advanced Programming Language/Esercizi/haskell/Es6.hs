module Es6 where
classify :: (Int, Int) -> String
classify (0, 0) = "origin"
classify (_, 0) = "x-axis"
classify (0, _) = "y-axis"
classify (_, _) = "other"
classify (x, y)
    | x > 0 && y > 0 = "first quadrant"
    | x < 0 && y > 0 = "second quadrant"
    | x < 0 && y < 0 = "third quadrant"
    | x > 0 && y < 0 = "fourth quadrant"
-- Part A
data Color = Red | Green | Blue

instance Show Color where
    show Red = "RGB(1,0,0)"
    show Green = "RGB(0,1,0)"
    show Blue = "RGB(0,0,1)"

-- alternative deriving Show

data Tree a = Leaf | Node (Tree a) a (Tree a)
    deriving Show -- definire la rappresentazione di un nodo

-- Part B
class Container c a where
    empty :: c a
    insert :: a -> c a -> c a
    member :: Eq a => a -> c a -> Bool -- Eq because a must be comparable with Eq

instance Container [] a where -- for lists
    empty = []
    insert x xs = x : xs

    member _ [] = False
    member x (y:ys) = x == y || member x ys

newtype Set a = Set[a] -- new type definition
instance Eq a => Container Set a where -- bounded polymorphism because I can create the instance 
                                       -- for Container class named Container Set a if a is an instance of Eq (== in member function)
    empty = Set []
    insert x (Set xs) = if member x (Set xs)
                        then Set xs
                        else Set (x : xs)
    member x (Set xs) = member x xs  -- sfrutta member delle liste


-- Part C
data Json
    = JString String | JNumber Double | JBool Bool
    | JArray [Json] | JObject [(String, Json)]

-- a)
myJson = JObject 
        [ ("title:", JString "Advanced Programming Languages")
        , ("year", JNumber 2026.0)
        , ("instructors:", JArray [JString "M.Bugliesi"])
        ]

-- b)
int2json :: Int -> Json
int2json = \n -> JNumber (fromIntegral n)

string2json :: String -> Json
string2json = \s -> JString s

bool2json :: Bool -> Json
bool2json = \b -> JBool b

ints2json :: [Int] -> Json
ints2json [] = JArray []
int2sjson (x:xs) = case ints2json xs of
                    JArray ys -> JArray (JNumber (fromIntegral x) : ys)
 
strings2json :: [String] -> Json
strings2json [] = JArray []
strings2json (x:xs) = case strings2json xs of
                    JArray ys -> JArray (JString x : ys)

data Movie = Movie {
    title :: String,
    year :: Int,
    directors :: [String]
}

movie2json :: Movie -> Json
movie2json m = JObject [("title" , JString (title m)), ("year", JNumber (fromIntegral (year m))), ("directors", JArray (map JString (directors m)))]

-- alternativa pattern matching
-- movie2json :: Movie -> Json
--movie2json (Movie t y d) = JObject 
--    [ ("title",     JString t)
--    , ("year",      JNumber (fromIntegral y))
--    , ("directors", JArray (map JString d))
--    ]

class Jencode t where
    encode :: t -> Json

instance Jencode Int where
    encode n = int2json n

instance Jencode String where
    encode s = string2json s

instance Jencode Bool where
    encode b = bool2json b

instance Jencode a => Jencode[a] where
    encode xs = JArray (map encode xs)
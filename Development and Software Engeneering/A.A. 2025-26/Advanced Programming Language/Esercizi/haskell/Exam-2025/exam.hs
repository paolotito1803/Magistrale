-- Definiamo la struttura del nodo XML
data XmlNode 
    = XmlText String
    | XmlAttribute String String
    | XmlElement String [XmlNode] [XmlNode] -- Nome, Lista di Attributi, Lista di Figli
    deriving (Show, Eq)

--Ex. 3
book = XmlElement "book" [] [XmlElement "aaa" [] [XmlText "pippo"], XmlElement "bbb" [] [XmlText "author"]]

--Ex 4
intToXML :: Int -> XmlNode
intToXML i = XmlElement "int" [] [XmlText (show i)]

stringToXML :: String -> XmlNode
stringToXML s = XmlElement "string" [] [XmlText s]

intsToXML :: [Int] -> XmlNode
intsToXML intList = XmlElement "ints" [] (map intToXML intList)
-- intsToXML (x : xs) = XmlElement "ints" [] [intToXML x : intsToXML xs]

stringsToXML :: [String] -> XmlNode
stringssToXML stringList = XmlElement "strings" [] (map stringToXML stringist)
-- stringssToXML (x : xs) = XmlElement "strings" [] [stringToXML x : strubgsToXML xs]

-- Tipi di dati per le entità personali
data Country = Country { countryName :: String, countryState :: String } deriving (Show)
data Person  = Person { personName :: String, personAge :: Int, personCountry :: Country } deriving (Show)

--Ex 5
countryToXml :: Country -> XmlNode
countryToXml country = 
    XmlElement "country" [] 
        [XmlElement "countrName" [] [XmlText (countryName country)], 
        XmlElement "countryState" [] [XmlText (countryState country)]
        ]

personToXml :: Person -> XmlNode
personToXml person = 
    XmlElement "person" [] 
        [XmlElement "personName" [] [XmlText (personName person)], 
        XmlElement "personAge" [] [XmlText (sow (personAge person))],
         countryToXml (personCountry person)
         ]

--Ex 6
reduceRight :: (a -> a -> a) -> [a] -> a
reduceRight _ [] = error "error"
reduceRight _ [x] = x
reduceRight f (x : xs) = f x (reduceRight f xs)

maxElement :: [Int] -> Int
maxElement = reduceRight (\x y -> if x > y then x else y)

-- Modelli dati per il business
data Customer = Customer { custName :: String, custEmail :: String }
data Invoice  = Invoice { invId :: Int, invAmount :: Double }
data Product  = Product { prodCode :: String, prodPrice :: Double }

-- Il Trait diventa una Type Class
class Export t where
    toCsv  :: t -> String
    toJson :: t -> String

-- Ex 7
instance Export Customer where
    toCsv c = custName c ++ ", " ++ custEmail c
    toJson c = "{name:" ++ custName c ++ "email:" ++ custEmail c ++ "}"

instance Export Invoice where
    toCsv invoice = invId invoice ++ ", " ++ invAmount invoice
    toJson invoice = "{id:" ++ show (invId invoice) ++ "amount:" ++ show (invAmount invoice) ++ "}"
    
instance Export Product where
    toCsv product = prodCode product ++ ", " ++ prodPrice product
    toJson invoice = "{code:" ++ prodCode product ++ "price:" ++ show (prodPrice product) ++ "}"

exportAll :: Export t => [t] -> String -> [String]
exportAll tList format = 
    case format of
        "CSV" -> map toCsv tList
        "JSON" -> map toJson tList
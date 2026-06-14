enum XmlNode:
    case XmlText(text: String)
    case XmlAttribute(key: String, value: String)
    case class XmlElement(name: String, attributes: List[XmlAttribute] = Nil, children: List[XmlNode] = Nil)

val bookRepresentation: XmlNode = 
  XmlElement(
    name = "book",
    attributes = List(XmlAttribute("id", "b101")),
    children = List(
      XmlElement(
        name = "title", 
        attributes = Nil, 
        children = List(XmlText("Programming in Scala"))
      ),
      XmlElement(
        name = "author", 
        attributes = Nil, 
        children = List(XmlText("Martin Odersky"))
      )
    )
  )

  def intToXML(i: int): XmlNode = XmlElement("int", children = List(XmlText(i.toString)))
  def stringToXML(s: String): XmlNode = XmlElement("string", children = List(XmlText(s)))
  def intsToXML(list: List[Int]): XmlNode = XmlElement("ints", children = list.map(l => intToXML(l)))
  def stringsToXML(list: List[String]): XmlNode = XmlElement("strings", children = list.map(l => stringToXML(l)))

  case class Country(name: String, state: String)
  case class Person(name: String, age: Int, country: Country)

  def countryToXML(c: Country): XmlNode = XmlElement(
    name = "country",
    attributes = Nil,
    children = List(
      XmlElement("name", Nil, List(XmlText(c.name))),
      XmlElement("state", Nil, List(XmlText(c.state)))
    )
)
  def personToXML(p: Person): XmlNode = XmlElement(
    name = "Person",
    attributes = Nil,
    children = List(
        XmlElement("name", Nil, List(XmlText(p.name))),
        XmlElement("age", Nil, List(XmlText(p.age.toString))),
        XmlElement(
            name = "country",
            attributes = Nil,
            children = List(
                XmlElement("name", Nil, children = List(XmlText(p.country.name))),
                XmlElement("state", Nil, children = List(XmlText(p.country.state)))
            )
        )
    ) 
  )

  def maxElem(list: List[Int]): Int = 
    reduceRight[Int]((x, y) => if x > y then x else y)(list)

case class Customer(name: String, email: String)
case class Invoice(id: Int, amount: Double)
case class Product(code: String, price: Double)

trait Export[T]:
    def toCsv(t: T): String
    def toJson(t: T): String

given Export[Customer] with
    def toCsv(t: Customer): String = s"${t.name}, ${t.email}"
    def toJson(t: Customer): String = s"""{"name": "${t.name}", "email": "${t.email}"}"""

given Export[Invoice] with
    def toCsv(i: Invoice): String = s"${i.id},${i.amount}"
    def toJson(i: Invoice): String = s"""{"id": ${i.id}, "amount": ${i.amount}}"""

given Export[Product] with
    def toCsv(p: Product): String = s"${p.code},${p.price}"
    def toJson(p: Product): String = s"""{"code": "${p.code}", "price": ${p.price}}"""

def exportAll[T: Export](data: List[T], format: String): List[String] = format match {
    case "csv" => data.map(item => summon[Export[T]].toCsv(item))
    case "json" => data.map(item => summon[Export[T]].toJson(item))
}
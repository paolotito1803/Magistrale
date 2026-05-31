case class Customer(name: String, email: String)
case class Invoice(id: Int, amount: Double)
case class Product(code: String, price: String)

trait Export[T]:
  def toCSV(t: T) : String
  def toJson(t: T) : String

given Export[Invoice] with
  def toCSV(i: Invoice) : String = s"""${i.id}, ${i.amount}"""
  def toJson(i: Invoice) : String = s"""{"id": ${i.id}, "amount": ${i.amount}"}"""

given Export[Customer] with
  def toCSV(c: Customer) : String = s"""${c.name}, ${c.email}"""
  def toJson(c: Customer) : String = s"""{"name": ${c.name}, "email": ${c.email}"}"""

given Export[Product] with
  def toCSV(p: Product) : String = s"""${p.code}, ${p.price}"""
  def toJson(p: Product) : String = s"""{"code": ${p.code}, "price:" ${p.price}"}"""


def exportAll[T: Export](data: List[T], format: String) : List[String] = (data, format) match {
  case (_, "csv") => data.map(item => summon[Export[T]].toCSV(item))
  case (_,"json") => data.map(item => summon[Export[T]].toJson(item))
  case _ => Nil
}


@main
def main(): Unit = {
  val customers = List(
    Customer("Alice","alice@example.com"),
    Customer("Bob", "bob@example.com")
  )

  val invoices = List(
    Invoice(1, 99.99),
    Invoice(2, 149.50)
  )

  val csvCustomers = exportAll(customers, "csv")
  val jsonInvoices = exportAll(invoices, "json")

  println(csvCustomers)
  println(jsonInvoices)
}
enum Json:
  case JString(value: String)
  case JNumber(value: Double)
  case JBool(value: Boolean)
  case JArray(value: List[Json])
  case JObject(fields: List[(String, Json)])

// part A
val a = Json.JObject(List(("title", Json.JString("Advanced Programming Languages")),
  ("year",Json.JNumber(2026)),
  ("instructors", Json.JArray(List(Json.JString("M.Bugliesi"))))))

// part B
def int2json(n: Int) : Json = Json.JNumber(n)
def string2json(s: String) : Json = Json.JString(s)
def bool2json(b: Boolean) : Json = Json.JBool(b)
def ints2json(xs: List[Int]) : Json = Json.JArray(xs.map(n => int2json(n)))
def string2json(xs: List[String]) : Json = Json.JArray(xs.map(x => Json.JString(x)))

// part c
case class Movie(title: String, year: Int, directors: List[String])

def movie2json(movie: Movie) : Json = Json.JObject(List(("title", string2json(movie.title)),
                                                        ("year", int2json(movie.year)),
                                                        ("directors", Json.JArray(movie.directors.map(x => string2json(x))))))


/*@main
def main(): Unit = {
  println(movie2json(Movie("Inception",2010, List("Chistopher Nolan"))))
}*/

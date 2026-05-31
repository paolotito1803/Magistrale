// part d
trait Jencode[A]:
  def encode(value: A) : Json

  given Jencode[Int] with
    def encode(n: Int) = Json.JNumber(n)

  given Jencode[String] with
    def encode(s : String) = Json.JString(s)

  given Jencode[Boolean] with
    def encode(b : Boolean) = Json.JBool(b)

  given [A](using enc:Jencode[A]): Jencode[List[A]] with
    def encode(xs : List[A]) = Json.JArray(xs.map(x => enc.encode(x)))

  given Jencode[Movie] with
    def encode(movie: Movie) : Json =
      Json.JObject(List(
        ("title", summon[Jencode[String]].encode(movie.title)),
        ("year", summon[Jencode[Int]].encode(movie.year)),
        ("directors", summon[Jencode[List[String]]].encode(movie.directors))
      ))
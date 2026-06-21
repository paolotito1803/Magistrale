error id: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Challenges/Jencode.scala:
file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Challenges/Jencode.scala
empty definition using pc, found symbol in pc: 
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -xs.
	 -scala/Predef.xs.
offset: 392
uri: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Esercizi/Scala/src/main/scala/Challenges/Jencode.scala
text:
```scala
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
    def encode(xs : List[A]) = Json.JArray(x@@s.map(x => enc.encode(x)))

  given Jencode[Movie] with
    def encode(movie: Movie) : Json =
      Json.JObject(List(
        ("title", summon[Jencode[String]].encode(movie.title)),
        ("year", summon[Jencode[Int]].encode(movie.year)),
        ("directors", summon[Jencode[List[String]]].encode(movie.directors))
      ))
```


#### Short summary: 

empty definition using pc, found symbol in pc: 
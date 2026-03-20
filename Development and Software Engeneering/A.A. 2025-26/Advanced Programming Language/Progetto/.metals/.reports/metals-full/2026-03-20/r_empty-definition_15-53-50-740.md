error id: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Progetto/Part1/Scala/895227_Project1/src/main/scala/Groop_Project1.scala:scala/Predef.String#
file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Progetto/Part1/Scala/895227_Project1/src/main/scala/Groop_Project1.scala
empty definition using pc, found symbol in pc: scala/Predef.String#
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -String.
	 -String#
	 -String().
	 -scala/Predef.String.
	 -scala/Predef.String#
	 -scala/Predef.String().
offset: 3642
uri: file:///D:/Progetti/Magistrale/Development%20and%20Software%20Engeneering/A.A.%202025-26/Advanced%20Programming%20Language/Progetto/Part1/Scala/895227_Project1/src/main/scala/Groop_Project1.scala
text:
```scala
import scala.annotation.tailrec
// Part 1: Functions

// Interleave
def interleave[A](xs: List[A], ys: List[A]): List[A] = (xs, ys) match {
  case (Nil, b) => b
  case (a, Nil) => a
  case (hx :: tx, hy :: ty) => hx :: hy :: interleave(tx, ty)
}

// chuncks
def chunks[A](n: Int, list: List[A]): List[List[A]] = {

  if (n <= 0) Nil
  else list match {
    case Nil => Nil
    case _ =>
      val firstChunk = myTake(n, list)
      val remaining = myDrop(n, list)
      firstChunk :: chunks(n, remaining)
  }
}


def myTake[A](k: Int, list: List[A]): List[A] = (k, list) match {
  case (0, _) => Nil
  case (_, Nil) => Nil
  case (n, h :: t) => h :: myTake(n - 1, t)
}


def myDrop[A](k: Int, list: List[A]): List[A] = (k, list) match {
  case (0, l) => l
  case (_, Nil) => Nil
  case (n, _ :: t) => myDrop(n - 1, t)
}

// Rotate
def rotate[A](n: Int, list: List[A]): List[A] = {
  if(list.isEmpty) return Nil
  else{
    val rotation = ((n % list.length) + list.length) % list.length
    val leftPart = myTakeList(rotation, list)
    val rightPart = myDropList(rotation, list)

    myAppend(rightPart, leftPart)

  }
}

def myTakeList[A](k: Int, list: List[A]): List[A] = (k, list) match {
  case (0, _) => return Nil
  case(_, Nil) => return Nil
  case (count, h :: t) => h :: myTakeList(count-1, t)
}

def myDropList[A](k: Int, list: List[A]): List[A]= (k, list) match {
  case (0, l)=> return l
  case (_, Nil) => return Nil
  case (count, _ :: t) => myDropList(count-1, t)
}

def myAppend[A](list1: List[A], list2: List[A]): List[A] = list1 match {
  case Nil => list2
  case h :: t => h :: myAppend(t, list2)
}

// Frequqnecies
def frequencies[A](list: List[A]): List[(A, Int)] = {
  @tailrec
  def updateFreq(remaining: List[A], counterf: List[(A, Int)]): List[(A, Int)] = remaining match{
    case Nil => counterf
    case h :: t => updateFreq(t, increment(h, counterf))
  }

  def increment(item: A, acc: List[(A, Int)]): List[(A, Int)] = acc match {
    case Nil => List((item, 1))
    case (k, v) :: tail =>
      if (k == item) (k, v + 1) :: tail
      else (k, v) :: increment(item, tail)
  }

  updateFreq(list, Nil)
}


//Part 3: Cesar Cipher
object CesarCipher {

  // 1. ENCODE / DECODE
  def cesar(n: Int, text: String): String = {
    def loop(chars: List[Char]): List[Char] = chars match {
      case Nil => Nil
      case head :: tail => shiftChar(n, head) :: loop(tail)
    }
    loop(text.toList).mkString
  }

  private def shiftChar(n: Int, c: Char): Char = {
    if (c >= 'a' && c <= 'z') rotate(n, c, 'a')
    else if (c >= 'A' && c <= 'Z') rotate(n, c, 'A')
    else c
  }

  private def rotate(n: Int, c: Char, base: Char): Char = {
    val effN = ((c - base + n) % 26 + 26) % 26
    (base + effN).toChar
  }

  // 2. CRACK
  def crack(text: String): String = {
    def findBest(currentS: Int, bestS: Int, maxCount: Int): Int = {
      if (currentS > 25) bestS
      else {
        val currentCount = countE(cesar(currentS, text))
        if (currentCount > maxCount) findBest(currentS + 1, currentS, currentCount)
        else findBest(currentS + 1, bestS, maxCount)
      }
    }
    cesar(findBest(0, 0, -1), text)
  }

  private def countE(text: String): Int = {
    def loop(chars: List[Char]): Int = chars match {
      case Nil => 0
      case head :: tail => 
        val isE = if (head == 'e' || head == 'E') 1 else 0
        isE + loop(tail)
    }
    loop(text.toList)
  }
}ts(scores.indexOf(scores.max)){}
    cesar(bestShift, text)
  }

  private def countE(text: @@String): Int = {
    text.toLowerCase.count(_ == 'e')
  }
} 
```


#### Short summary: 

empty definition using pc, found symbol in pc: scala/Predef.String#
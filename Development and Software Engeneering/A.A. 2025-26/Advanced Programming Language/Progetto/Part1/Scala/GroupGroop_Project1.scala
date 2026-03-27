import scala.annotation.tailrec
import java.lang
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

  def myLength(l: List[A]): Int = l match {
    case Nil => 0
    case _ :: t => 1 + myLength(t)
  }

  list match {
    case Nil => Nil
    case _ => 
      val length = myLength(list)
      val rotation = ((n % myLength(list)) + myLength(list)) % myLength(list)
      val leftPart = myTakeList(rotation, list)
      val rightPart = myDropList(rotation, list)
      myAppend(rightPart, leftPart)
  }
}

def myTakeList[A](k: Int, list: List[A]): List[A] = (k, list) match {
  case (0, _) => Nil
  case(_, Nil) => Nil
  case (count, h :: t) => h :: myTakeList(count-1, t)
}

def myDropList[A](k: Int, list: List[A]): List[A]= (k, list) match {
  case (0, l) => l
  case (_, Nil) => Nil
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



// Part 2: Types Under the Microscope

// // 2.1

// // // interleave:

// In this function, all three annotation positions are explicit and need to be declared:
//   [A]          — type parameter declaration
//   xs/ys: List[A]  — parameters types
//   : List[A]    — return type

// 1. With no parameter types -> error: " ':' expected, but ')' found "
// This is because scala doesn't even consider in it's parsing the possibility of not defining the types, 
//  so there is no syntactic form for an untyped parameter, giving thus a sintax error.
// In Haskell -> parameter types are completely inferred, so this is not necessary.
/*def interleave2_1(xs, ys) = (xs, ys) match {
  case (Nil, b)              => b
  case (a, Nil)              => a
  case (hx :: tx, hy :: ty) => hx :: hy :: interleave2_1(tx, ty)
}*/

// 2. With no return type -> error: "Overloaded or recursive method interleave2_1 needs return type"
// This is because scala local type inference cannot look ahead before the return type is known, 
//  but it needs to know the return type to know the return type here, as it calls the function recursively.
// BUT, in general, non recursive returns can be inferred, and would compile.
// In Haskell -> the recursive call is treated as a type variable and solved with the others, so it can be omitted.
/*def interleave2_1[A](xs: List[A], ys: List[A]) = (xs, ys) match {
  case (Nil, b)              => b
  case (a, Nil)              => a
  case (hx :: tx, hy :: ty) => hx :: hy :: interleave2_1(tx, ty)
}*/

// 3. With no type parameter declaration -> 3 errors: "Not found: type A"
// This is because without defining the name A it's just an undefined identifier.
// In Haskell -> lowercase type variables (a, b, ...) are implicit and there's no need to write declare them.
/*def interleave(xs: List[A], ys: List[A]): List[A] = (xs, ys) match {
  case (Nil, b) => b
  case (a, Nil) => a
  case (hx :: tx, hy :: ty) => hx :: hy :: interleave(tx, ty)
}*/

// // // frequencies:

// A difference here is that there are inner functions, for them, the same types necessities and errors apply than with the outer functions, 
//  as these are evaluated indepentently, so even fully defining the outer parameters, the inner functions need theirs defined too.
//  Because they are all recursive as well, all the recursive types are necessary as well.
// In Haskell -> they are inferred automatically same as any other function.

// 1. No return type on updateFreq (which is recursive) -> error: "Overloaded or recursive method updateFreq needs return type"
/*def frequencies2_1[A](list: List[A]): List[(A, Int)] = {
  @scala.annotation.tailrec
  def updateFreq(remaining: List[A], counterf: List[(A, Int)]) = remaining match {
    case Nil    => counterf
    case h :: t => updateFreq(t, increment(h, counterf))
  }

  def increment(item: A, acc: List[(A, Int)]): List[(A, Int)] = acc match {
    case Nil            => List((item, 1))
    case (k, v) :: tail =>
      if (k == item) (k, v + 1) :: tail
      else           (k, v)     :: increment(item, tail)
  }

  updateFreq(list, Nil)
}*/

// 2. No return type on increment (also recursive) -> error: "Overloaded or recursive method increment needs return type"
// It's the same as with updateFreq.
/*def frequencies2_1[A](list: List[A]): List[(A, Int)] = {
  @scala.annotation.tailrec
  def updateFreq(remaining: List[A], counterf: List[(A, Int)]): List[(A, Int)] = remaining match {
    case Nil    => counterf
    case h :: t => updateFreq(t, increment(h, counterf))
  }

  def increment(item: A, acc: List[(A, Int)]) = acc match {
    case Nil            => List((item, 1))
    case (k, v) :: tail =>
      if (k == item) (k, v + 1) :: tail
      else           (k, v)     :: increment(item, tail)
  }

  updateFreq(list, Nil)
}*/

// 3. No return type on frequencies -> compiles with no error or warning
// Inference here in scala can infer the return type, as the internal functions have an explicit return type, 
//  and the frequencies function is not itself recursive.
//  The type inferred automatically here is the same as the type we had written explicitly: "frequencies_2_1[A](list: List[A]): List[(A, Int)]"
def frequencies2_1[A](list: List[A]) = {
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


// Part 3 -- Caesar Cipher

def myHead[A](list: List[A]): A = list match {
  case h :: t => h
  case Nil => throw new NoSuchElementException("empty list")
}

def encode(n: Int, s: String): String = {
  def rotateLetter(n: Int, c: Char): Char = c match {
    case c if c >= 'a' && c <= 'z' => myHead(rotate(n+(c.toInt-'a'.toInt), ('a' to 'z').toList))
    case c if c >= 'A' && c <= 'Z' => myHead(rotate(n+(c.toInt-'a'.toInt), ('A' to 'Z').toList))
    case c => c
  }

  def encodeHelper(n: Int, l: List[Char]): List[Char] = (n,l) match {
    case (n, Nil) => Nil
    case (n, h :: t) => rotateLetter(n, h) :: encodeHelper(n, t)
  }

  encodeHelper(n, s.toList).mkString("")
}

def decode(n: Int,s: String): String = {
  encode(-n,s)
}

def crackCipher(s: String) = {
  def my_map[A, B](f: A => B, xs: List[A]): List[B] = {
    for x <- xs yield f(x)
  }

  def my_filter[A](f: A => Boolean, xs: List[A]): List[A] = (f, xs) match {
    case (_, Nil) => Nil
    case (f, x :: xs) => if f(x) then { x :: my_filter(f, xs) } else { my_filter(f, xs) }
  }

  def my_elem[A](e: A, l: List[A]): Boolean = l match {
    case Nil => false
    case x :: xs => if (x == e) then {true} else {my_elem(e, xs)}
  }

  def my_fst[A,B](x: (A,B)): A = x match {
    case (y,z) => y
  }

  def my_snd[A,B](x: (A,B)): B = x match {
    case (y,z) => z
  }

  def maxFreq(xs: List[(Char, Int)]): Char = {
    def submax(x: (Char, Int), xs: List[(Char, Int)]): Char = (x, xs) match {
      case ((a,_), Nil) => a
      case ((a,a2), ((b,b2)::r)) => if a2 < b2 then { submax((b,b2),r) } else { submax((a,a2), r) }
    }
    xs match {
      case (x :: xs) => submax(x, xs)
      case Nil => throw new NoSuchElementException("empty list")
    }
  }

  my_fst(
    myHead(
      my_filter(
        (x: (Int, Char)) => ((my_snd(x) == 'e') || (my_snd(x) == 'E')),
        my_map(
          (x: (Int, List[(Char, Int)])) => (my_fst(x), maxFreq(my_snd(x))),
          my_map(
            (x: (Int, List[Char])) => (my_fst(x),frequencies(my_snd(x))),
            my_map(
              (x: (Int, String)) => (my_fst(x),
                                     my_filter((c: Char) => my_elem(c, ('a' to 'z').toList ++ ('A' to 'Z').toList), my_snd(x).toList)),
              my_map((x: Int) => (x, decode(x,s)), (0 to 25).toList)
            )
          )
        )
      )
    )
  )
}
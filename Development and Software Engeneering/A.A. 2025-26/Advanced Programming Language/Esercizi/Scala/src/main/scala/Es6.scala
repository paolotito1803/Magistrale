def classify(point: (Int, Int)): String = point match {
  case (0,0)=> "origin"
  case (0, _)=> "y axis"
  case(_, 0)=> "x axis"
  case _ =>"something else"
}

def classify(point: (Int, Int)): String = point match {
  case (0, 0) => "origin"
  case (0, _) => "y axis"
  case (_, 0) => "x axis"
  case _ => "something else"
}
defmodule Geometry do
  def classify(point) do
    case point do
      {0, 0} -> "Origin"
      {x, 0} when x > 0 -> "Positive X-axis"
      {x, 0} when x < 0 -> "Negative X-axis"
      {0, y} when y > 0 -> "Positive Y-axis"
      {0, y} when y < 0 -> "Negative Y-axis"
      {x, y} when x > 0 and y > 0 -> "Quadrant I"
      {x, y} when x < 0 and y > 0 -> "Quadrant II"
      {x, y} when x < 0 and y < 0 -> "Quadrant III"
      {x, y} when x > 0 and y < 0 -> "Quadrant IV"
      _ -> "Unknown"
    end
  end
end

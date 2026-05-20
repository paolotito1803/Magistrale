defmodule ZipWith do
  def my_zip_with(f, xs, ys) do
    case {xs, ys} do
      {[], _} -> []
      {_, []} -> []
      {[x | x_tail], [y | y_tail]} -> [f.(x, y) | my_zip_with(f, x_tail, y_tail)]
    end
  end
end

defmodule MyList do
  def my_max(list) do
    case list do
      [x] -> x
      [x | xs] -> max(x, my_max(xs))
    end
  end
end

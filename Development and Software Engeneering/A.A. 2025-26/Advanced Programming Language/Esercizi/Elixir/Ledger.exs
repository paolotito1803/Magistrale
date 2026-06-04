defmodule Transfer do
  defstruct [:from, :to, :amount, :timestamp]
end

defmodule ContractDeploy do
  defstruct [:owner, :bytecode, :gas_limit, :timestamp]
end

defmodule ContractCall do
  defstruct [:caller, :contract, :function, :gas_limit, :timestamp]
end

defmodule Ledger do
  def fee(%Transfer{amount: a}), do: a * 0.01
  def fee(%ContractDeploy{gas_limit: gl}), do: fromIntegral(gl) * 0.000001
  def fee(%ContractCall{gas_limit: gl}), do: fromIntegral(gl) * 0.000001

  def gas_cost(%Tranfer{}), do: 21000
  def gas_cost(%ContractDeploy{bytecode: bc}), do: 32000 + 200 * String.length(bc)
  def gas_cost(%CoontractCall{function: f}), do: 50000 + 200 * String.length(f)

  def is_valid(%Transfer{from: f, to: t, amount: a}), do: a > 0 and f != t
  def is_valid(%ContractDeploy{bytecode: bc, gas_limit: gl}), do: String.length(bc) > 0 and gl >= gas_cost(%ContractDeploy{bytecode: bc, gas_limit: gl})
  def is_valid(%ContractCall{caller: c, function: f, gas_limit: gl}), do: String.length(f) > 0 and gl >= gas_cost(%ContractCall{function: f, gas_limit: gl})

  def describe(%Transfer{from: f, to: t, amount: a, timestamp: ts}), do: "Transfer: #{f} -> #{t} #{a} @#{ts}"
  def describe(%ContractDeploy{owner: o, gas_limit: g, timestamp: ts}), do: "Deploy: #{o} deploys contract (#{g} gas) @#{ts}"
  def describe(%ContractCall{caller: c, contract: ct, function: f, gas_limit: g, timestamp: ts}), do: "Call: #{c} calls #{f} on #{ct} (#{g} gas) @#{ts}"

  def total_fees(txs), do: txs |> Enum.map(fee/1) |> Enum.sum()

  def filter_by_address(addr, txs), do: Enum.filter(txs, fn tx -> case tx do
    %Transfer{from: f, to: t} -> f == addr or t == addr
    %ContractDeploy{owner: o} -> o == addr
    %ContractCall{caller: c} -> c == addr
  end
  end)

  def tx_in_range(lo, hi, txs), do: Enum.filter(txs , fn tx -> case tx do
    %Transfer{timestamp: t} -> t >= lo and t <= hi
    %ContractDeploy{timestamp: t} -> t >= lo and t <= hi
    %ContractCall{timestamp: t} -> t >= lo and t <= hi
  end
 end)

  def group_by_kind(txs) do
    Enum.reduce(txs, {[], [], []},
      fn
        %Transfer{} = t, {ts, ds, cs} -> {[t | ts], ds, cs}
        %ContractDeploy{} = t, {ts, ds, cs} -> {ts, [t | ds], cs}
        %ContractCall{} = t, {ts, ds, cs} -> {ts, ds, [t | cs]}
      end
    )
  end
end

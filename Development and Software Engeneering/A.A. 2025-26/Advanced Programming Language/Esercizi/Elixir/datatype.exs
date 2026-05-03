defmodule Transfer do
  defstruct [:from, :to, :amount, :timestamp]
end

defmodule ContractDeploy do
  defstruct [:owner, :byteCode, :gas_limit, :timestamp]
end

defmodule ContractCall do
  defstruct [:caller, :contract, :function, :gas_limit, :timestamp]
end

defmodule Ledger do
  def fee(%Transfer{amount: amount}), do: amount * 0.01
  def fee(%ContractDeploy{gas_limit: gas_limit}), do: gas_limit * 0.00001
  def fee(%ContractCall{gas_limit: gas_limit}), do: gas_limit * 0.000001

  def gas_cost(%Transfer{}), do: 21000
  def gas_cost(%ContractDeploy{byteCode: byte_code}), do: 32000 + 200 * String.length(byte_code)
  def gas_cost(%ContractCall{function: function}), do: 5000 + 100 * String.length(function)

  def is_valid(%Transfer{amount: amount, from: from, to: to}), do: amount > 0 && from != to
  def is_valid(%ContractDeploy{byteCode: byte_code, gas_limit: gas_limit}), do: String.length(byte_code) > 0 && gas_limit >= gas_cost(%ContractDeploy{byteCode: byte_code})
  def is_valid(%ContractCall{function: function, gas_limit: gas_limit}), do: String.length(function) > 0 && gas_limit >= gas_cost(%ContractCall{function: function})

  def describe(%Transfer{from: from, to: to, amount: amount, timestamp: timestamp} = transfer) do
    "Transfer of #{amount} from #{from} to #{to} at timestamp #{timestamp} with fee #{fee(transfer)} and gas cost #{gas_cost(transfer)}. Valid: #{is_valid(transfer)}"
  end
  def describe(%ContractDeploy{owner: owner, timestamp: timestamp} = deploy) do
    "Contract deployment by #{owner} at timestamp #{timestamp} with fee #{fee(deploy)} and gas cost #{gas_cost(deploy)}. Valid: #{is_valid(deploy)}"
  end
  def describe(%ContractCall{caller: caller, contract: contract, function: function, timestamp: timestamp} = call) do
    "Contract call by #{caller} to #{contract} function #{function} at timestamp #{timestamp} with fee #{fee(call)} and gas cost #{gas_cost(call)}. Valid: #{is_valid(call)}"
  end
end

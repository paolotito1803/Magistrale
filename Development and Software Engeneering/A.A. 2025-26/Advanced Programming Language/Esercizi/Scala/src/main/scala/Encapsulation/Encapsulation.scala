object Wallet {
    opaque type Money = (Int, Int)
    opaque type Wallet = (List[Money], List[Money], Int)

    def emptyWallet: Wallet = (Nil, Nil, 0)

    def mint(w: Wallet, a: Int): (Wallet, Money) = {
        val (spent, unspent, next) = w
        val newMoney: Money = (next, a)
        val newWallet: Wallet = (spent, newMoney :: unspent, next + 1)
        (newWallet, newMoney)
    }

    def spend(w: Wallet, m: Money): Either[String, (Int, Wallet)] = {
        val (spent, unspent, next) = w
        val (id, amount) = m
        if(unspent.contains(m)) {
            val newWallet: Wallet = (m :: spent, unspent.filterNot(_ == m), next)
            Right((amount, newWallet))
        }
        else Left((w, false))
    }

    def validity(w: Wallet, m: Money): Boolean = {
        val (spent, unspent, next) = w
        unspent.contains(m)
    }
}
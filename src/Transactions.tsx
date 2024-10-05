// src/Transactions.tsx
import React from "react";
import { gql, useQuery } from "@apollo/client";

interface TransactionsProps {
  slug: string;
}

interface Transaction {
  id: string;
  amount: {
    valueInCents: number;
    currency: string;
  };
  createdAt: string;
  type: "CREDIT" | "DEBIT";
  description: string;
  account: {
    name: string;
    imageUrl: string;
  };
  fromAccount: {
    name: string;
    imageUrl: string;
  };
  toAccount: {
    name: string;
    imageUrl: string;
  };
}

interface CollectiveData {
  collective: {
    name: string;
    stats: {
        balance: {
          valueInCents: number;
          currency: string;
        } | null;
        totalAmountReceived: {
          valueInCents: number;
          currency: string;
        };
        totalAmountSpent: {
          valueInCents: number;
          currency: string;
        };
        contributionsCount: number;
        contributorsCount: number;
      };
    transactions: {
      nodes: Transaction[];
    };
  };
}

interface CollectiveVars {
  slug: string;
}

const GET_TRANSACTIONS = gql`
  query GetTransactions($slug: String!) {
    collective(slug: $slug) {
      name
      stats {
        balance {
          valueInCents
          currency
        }
        totalAmountReceived(net: true) {
          valueInCents
          currency
        }
        totalAmountSpent {
          valueInCents
          currency
        }
        contributionsCount
        contributorsCount
      }
      transactions(limit: 20) {
        nodes {
          id
          amount {
            valueInCents
            currency
          }
          createdAt
          type
          description
          account {
            name
            imageUrl
          }
          fromAccount {
            name
            imageUrl
          }
            toAccount {
            name
            imageUrl
          }
        }
      }
    }
  }
`;

const formatCurrency = (valueInCents: number, currency: string) => {
  const value = valueInCents / 100;

  // Definieren Sie die Optionen basierend auf dem Betrag.
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    ...(Math.abs(value) >= 1000 ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
  };

  return new Intl.NumberFormat('de-DE', options).format(value);
};





const Transactions: React.FC<TransactionsProps> = ({ slug }) => {
  const { loading, error, data } = useQuery<CollectiveData, CollectiveVars>(GET_TRANSACTIONS, {
    variables: { slug },
  });

  if (loading) return (<div className="flex justify-center">
  <span className="loading loading-spinner loading-lg text-neutral-content"></span>
</div>);
  if (error) {
    console.error("GraphQL error:", error);
    return <p className="text-center text-lg text-red-500">Error: {error.message}</p>;
  }

  if (!data || !data.collective) {
    return <p className="text-center text-lg text-red-500">No data available for this collective.</p>;
  }

  const { stats, transactions } = data.collective;
  const balanceValueInCents = stats?.balance?.valueInCents ?? 0; // Falls undefined, wird 0 verwendet
  const currency = stats?.balance?.currency ?? "USD"; // Falls undefined, wird "USD" verwendet
  const currentBalance = balanceValueInCents;

  const filteredTransactions = transactions.nodes.filter(
    (txn) => !txn.description.toLowerCase().includes("host fee") &&
             !txn.description.toLowerCase().includes("payment processor fee")
  );

  return (
    <div className="">


<div className="stats shadow mb-12">
  <div className="stat">
    <div className="stat-title">Current Balance</div>
    <div className="stat-value">{formatCurrency(currentBalance, currency)}</div>
    <div className="stat-desc"></div>
  </div>
  <div className="stat">
    <div className="stat-title">Received</div>
    <div className="stat-value text-green-500">{formatCurrency(stats.totalAmountReceived.valueInCents, currency)}</div>
  </div>
  <div className="stat">
    <div className="stat-title">Spent</div>
    <div className="stat-value text-red-500">{formatCurrency(stats.totalAmountReceived.valueInCents-currentBalance,currency)}</div>
  </div>
</div>



<div className="flex flex-col justify-between gap-6">

{transactions.nodes.length != 0 &&
<>
 <div className="flex-1 bg-base-100">
    <h4 className="text-lg font-bold mb-4">Latest Transactions</h4>
    <ul className="list-none">
      {filteredTransactions.map((txn) => (
        <li key={txn.id} className="mb-4 flex items-center">
          <div className="flex items-center justify-between w-full">
            {/* Container für das Bild und den Beschreibungstext */}
            <div className="flex items-center">
              {/* Bild */}
              <img
                src={
                  txn.type === "CREDIT"
                    ? txn.fromAccount.imageUrl
                    : txn.toAccount.imageUrl
                }
                alt={
                  txn.type === "CREDIT"
                    ? txn.fromAccount.name
                    : txn.toAccount.name
                }
                className="w-12 h-12 rounded-full mr-3"
              />

              {/* Beschreibungstext */}
              <div>
                <p className="font-semibold">{txn.description}</p>
                {txn.type === "CREDIT"
                  ? txn.fromAccount.name
                  : txn.toAccount.name}{" "}
                on {new Date(txn.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Betrag */}
            <div
              className={`font-bold ${
                txn.type === "CREDIT" ? " text-green-600" : " text-red-700"
              }`}
            >
              {txn.type === "CREDIT" ? "+" : ""}
              {txn.amount.valueInCents / 100} {txn.amount.currency}
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
  
  <div className="flex justify-end w-full">
    <a className=" text-blue-600" href={`https://opencollective.com/${slug}/transactions`}>
      show all transactions ...
    </a>
  </div>
  </>
  }
</div>

    </div>
  );
};

export default Transactions;

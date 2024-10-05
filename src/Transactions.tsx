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
        contributionsCount
        contributorsCount
      }
      transactions(limit: 10) {
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

const Transactions: React.FC<TransactionsProps> = ({ slug }) => {
  const { loading, error, data } = useQuery<CollectiveData, CollectiveVars>(GET_TRANSACTIONS, {
    variables: { slug },
  });

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) {
    console.error("GraphQL error:", error);
    return <p className="text-center text-lg text-red-500">Error: {error.message}</p>;
  }

  if (!data || !data.collective) {
    return <p className="text-center text-lg text-red-500">No data available for this collective.</p>;
  }

  const { name, stats, transactions } = data.collective;
  const balanceValueInCents = stats?.balance?.valueInCents ?? 0; // Falls undefined, wird 0 verwendet
  const currency = stats?.balance?.currency ?? "USD"; // Falls undefined, wird "USD" verwendet
  const currentBalance = balanceValueInCents / 100;

  return (
    <div className="">
      <h2 className="text-2xl font-bold text-center mb-4">Transactions for {name}</h2>


      <div className="stats shadow mb-4">
  <div className="stat">
    <div className="stat-title">Current Balance</div>
    <div className="stat-value">{currentBalance} {currency}</div>
    <div className="stat-desc">21% more than last month</div>
  </div>
  <div className="stat">
    <div className="stat-title">Contributions</div>
    <div className="stat-value">{stats.contributionsCount}</div>
    <div className="stat-desc">21% more than last month</div>
  </div>
  <div className="stat">
    <div className="stat-title">Contributors</div>
    <div className="stat-value">{stats.contributorsCount}</div>
    <div className="stat-desc">21% more than last month</div>
  </div>
</div>

      <div className="flex flex-col justify-between gap-6">
        {/* Deposits Column */}
        <div className="flex-1 bg-base-100">
          <h4 className="text-lg font-bold mb-3">Transactions</h4>
          <ul className="list-none">
            {transactions.nodes.map((txn) => (
             <li key={txn.id} className="mb-2 flex items-center">
             <div className="flex items-center justify-between w-full">
               {/* Container für das Bild und den Beschreibungstext */}
               <div className="flex items-center">
                 {/* Bild */}
                 <img
                   src={txn.type === "CREDIT"? txn.fromAccount.imageUrl : txn.toAccount.imageUrl}
                   alt={txn.type === "CREDIT"? txn.fromAccount.name : txn.toAccount.name}
                   className="w-12 h-12 rounded-full mr-3"
                 />
                 
                 {/* Beschreibungstext */}
                 <div>
                   <p className="font-semibold">{txn.description}</p>
                   {txn.type === "CREDIT"? txn.fromAccount.name : txn.toAccount.name} on {new Date(txn.createdAt).toLocaleDateString()}
                 </div>
               </div>
               
               {/* Betrag */}
               <div className={`font-bold ${txn.type === "CREDIT"? " text-green-600" : " text-red-700"}`}>
                 {txn.type === "CREDIT"? "+":""}{txn.amount.valueInCents / 100}{" "}{txn.amount.currency}
               </div>
             </div>
           </li>
           
            ))}
          </ul>
        </div>


      </div>
    </div>
  );
};

export default Transactions;

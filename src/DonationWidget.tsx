// src/DonationWidget.tsx
import React from "react";
import { gql, useQuery } from "@apollo/client";

interface DonationWidgetProps {
  slug: string;
}

interface Tier {
  id: string;
  slug: string;
  legacyId: string;
  name: string;
  description: string;
  amount: {
    value: number;
    currency: string;
  };
  interval: string | null;
}

interface CollectiveData {
  collective: {
    name: string;
    tiers: {
      nodes: Tier[];
    };
  };
}

interface CollectiveVars {
  slug: string;
}

const GET_TIERS = gql`
  query GetTiers($slug: String!) {
    collective(slug: $slug) {
      name
      tiers {
        nodes {
          id
          slug
          legacyId
          name
          description
          amount {
            value
            currency
          }
          interval
        }
      }
    }
  }
`;

const DonationWidget: React.FC<DonationWidgetProps> = ({ slug }) => {
  const { loading, error, data } = useQuery<CollectiveData, CollectiveVars>(GET_TIERS, {
    variables: { slug },
  });

  if (loading) return <p>Loading donation options...</p>;
  if (error) return <p>Error loading donation options: {error.message}</p>;

  if (!data || !data.collective) {
    return <p>No donation options available for this collective.</p>;
  }

  const { name, tiers } = data.collective;

  return (
    <div className="donation-widget bg-base-100">
      <h3 className="text-lg font-bold mb-4">Support {name}</h3>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="tier-item p-4 border rounded-lg hover:shadow-lg">
          <h4 className="text-lg font-semibold">One-Time Donation</h4>
          <p className="text-sm mb-2">Support us with a one-time donation of any amount.</p>
          <a
            href={`https://opencollective.com/${slug}/donate`}
            className="btn btn-primary mt-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Donate One-Time
          </a>
        </div>
  {tiers.nodes.map((tier) => (
    <div key={tier.id} className="tier-item p-4 border rounded-lg hover:shadow-lg">
      <h4 className="text-lg font-semibold">{tier.name}</h4>
      <p className="text-sm mb-2">{tier.description}</p>
      <p className="text-md font-bold">
        {tier.amount.value} {tier.amount.currency}{" "}
        {tier.interval ? `per ${tier.interval}` : "One-Time"}
      </p>
      <a
        href={`https://opencollective.com/${slug}/contribute/${tier.slug.replace(/\s+/g, '-').toLowerCase()}-${tier.legacyId}/checkout`}
        className="btn btn-primary mt-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        Donate {tier.interval ? ` ${tier.interval}ly` : ""}
      </a>
    </div>
  ))}
</div>

    </div>
  );
};

export default DonationWidget;

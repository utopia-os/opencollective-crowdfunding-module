// src/App.tsx
import React, { useState } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import DonationWidget from "./DonationWidget";
import Transactions from "./Transactions";

const client = new ApolloClient({
  uri: "https://api.opencollective.com/graphql/v2",
  cache: new InMemoryCache(),
});

const App: React.FC = () => {
  const [slug, setSlug] = useState<string>("webpack");

  const handleSlugChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newSlug = (e.currentTarget.elements.namedItem("slug") as HTMLInputElement).value.trim();
    if (newSlug) {
      setSlug(newSlug);
    }
  };

  return (
    <ApolloProvider client={client}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Open Collective Transactions & Donations</h1>
        <form onSubmit={handleSlugChange} className="flex flex-col md:flex-row items-center justify-center mb-8 gap-4">
          <input
            type="text"
            name="slug"
            defaultValue={slug}
            className="input input-bordered w-full max-w-xs"
            placeholder="Enter Collective Slug"
          />
          <button type="submit" className="btn btn-primary w-full md:w-auto">
            Load Data
          </button>
        </form>
        <hr/>
        <div className="mt-8 p-4 border rounded-lg hover:shadow-lg">
        <Transactions slug={slug} />
        <div className="mt-8"/>
        <DonationWidget slug={slug} />
        </div>

      </div>
    </ApolloProvider>
  );
};

export default App;

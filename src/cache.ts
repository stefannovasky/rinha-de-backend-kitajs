type CustomerLimit = { id: number; limit: number; };

const CustomerCache = () => {
  const customers = new Map<number, CustomerLimit>();

  return {
    get(id: number) { return customers.get(id); },
    set(id: number, customer: CustomerLimit) {
      customers.set(id, customer);
    },
  };
};

export const customersCache = CustomerCache();

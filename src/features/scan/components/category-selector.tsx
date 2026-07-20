import type { ProductCategory } from "../model/types";

const CATEGORIES: readonly {
  id: ProductCategory;
  label: string;
  scope: string;
  marker: string;
}[] = [
  {
    id: "household_consumer_product",
    label: "Household and consumer products",
    scope: "Recall notices for supported consumer products",
    marker: "HOME",
  },
  {
    id: "food_infant_formula",
    label: "Food and infant formula",
    scope: "Dated food enforcement records",
    marker: "FOOD",
  },
  {
    id: "car_light_vehicle",
    label: "Cars and light vehicles",
    scope: "Vehicle-type campaign records",
    marker: "AUTO",
  },
];

interface CategorySelectorProps {
  readonly selected: ProductCategory | null;
  readonly onSelect: (category: ProductCategory) => void;
}

export function CategorySelector({
  selected,
  onSelect,
}: CategorySelectorProps) {
  return (
    <fieldset aria-describedby="category-routing-note">
      <legend>Which kind of item are you checking?</legend>
      <div role="list">
        {CATEGORIES.map((category) => (
          <label key={category.id} role="listitem">
            <input
              type="radio"
              name="product-category"
              value={category.id}
              checked={selected === category.id}
              onChange={() => onSelect(category.id)}
            />
            <span aria-hidden="true">{category.marker}</span>
            <span>
              <strong>{category.label}</strong>
              <small>{category.scope}</small>
            </span>
          </label>
        ))}
      </div>
      <p id="category-routing-note">
        Deterministic routing uses your confirmed category to determine the
        eligible official source before any query. You can change it first.
      </p>
    </fieldset>
  );
}

import { Icon } from '@iconify/react';
import { Coffee } from 'lucide-react';

interface DrinkIconProps {
  drinkName: string;
  className?: string;
  size?: number;
}

// Map drink names to appropriate icons from various libraries
const getDrinkIcon = (drinkName: string) => {
  const name = drinkName.toLowerCase();

  // Matcha drinks
  if (name.includes('matcha')) {
    return { icon: 'mdi:leaf', type: 'iconify' };
  }

  // Iced drinks
  if (name.includes('iced') || name.includes('ice')) {
    if (name.includes('latte') || name.includes('coffee')) {
      return { icon: 'fa-solid:coffee', type: 'iconify' };
    }
    return { icon: 'mdi:snowflake', type: 'iconify' };
  }

  // Hot drinks
  if (name.includes('hot') || name.includes('warm')) {
    return { icon: 'fa-solid:mug-hot', type: 'iconify' };
  }

  // Tea drinks
  if (name.includes('tea') || name.includes('chai') || name.includes('herbal')) {
    return { icon: 'mdi:leaf', type: 'iconify' };
  }

  // Espresso shots
  if (name.includes('espresso') || name.includes('shot')) {
    return { icon: 'mdi:coffee', type: 'iconify' };
  }

  // Latte drinks
  if (name.includes('latte') || name.includes('mocha')) {
    return { icon: 'mdi:coffee-outline', type: 'iconify' };
  }

  // Cappuccino
  if (name.includes('cappuccino') || name.includes('cap')) {
    return { icon: 'fa-solid:mug-saucer', type: 'iconify' };
  }

  // Cold brew
  if (name.includes('cold brew') || name.includes('cold-brew')) {
    return { icon: 'materialsymbols:coffee', type: 'iconify' };
  }

  // Pour over / drip
  if (name.includes('pour over') || name.includes('pour-over') || name.includes('drip')) {
    return { icon: 'mdi:filter', type: 'iconify' };
  }

  // Americano
  if (name.includes('americano')) {
    return { icon: 'fa-solid:mug-hot', type: 'iconify' };
  }

  // Macchiato
  if (name.includes('macchiato')) {
    return { icon: 'fa-solid:coffee', type: 'iconify' };
  }

  // Flat white
  if (name.includes('flat white')) {
    return { icon: 'game-icons:mug', type: 'iconify' };
  }

  // Affogato
  if (name.includes('affogato')) {
    return { icon: 'mdi:ice-cream', type: 'iconify' };
  }

  // Smoothies
  if (name.includes('smoothie') || name.includes('blend')) {
    return { icon: 'mdi:blender', type: 'iconify' };
  }

  // Frappe
  if (name.includes('frappe') || name.includes('frappé')) {
    return { icon: 'mdi:cup', type: 'iconify' };
  }

  // Default coffee icon
  return { icon: 'default', type: 'lucide' };
};

export default function DrinkIcon({ drinkName, className = '', size = 24 }: DrinkIconProps) {
  const iconData = getDrinkIcon(drinkName);

  if (iconData.type === 'iconify') {
    return (
      <Icon
        icon={iconData.icon}
        className={className}
        width={size}
        height={size}
      />
    );
  }

  // Default Lucide coffee icon
  return <Coffee className={className} style={{ width: size, height: size }} />;
}

// Export the icon data for use elsewhere
export { getDrinkIcon };

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useTheme, predefinedThemes } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ThemePickerProps {
  isSidebarOpen?: boolean;
}

export function ThemePicker({ isSidebarOpen = true }: ThemePickerProps) {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const triggerButton = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        !isSidebarOpen && "justify-center px-2"
      )}
    >
      <Palette className="w-5 h-5 flex-shrink-0" />
      {isSidebarOpen && <span>Theme Colors</span>}
    </Button>
  );

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        {!isSidebarOpen ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                {triggerButton}
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Theme Colors</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <PopoverTrigger asChild>
            {triggerButton}
          </PopoverTrigger>
        )}
        <PopoverContent 
          className="w-80 bg-card border-border p-4" 
          align={!isSidebarOpen ? "center" : "start"}
          side="right"
        >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Choose Theme</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {predefinedThemes.map((theme) => {
              const isActive = currentTheme.name === theme.name;
              const [hue, sat, light] = theme.primary.split(' ');
              
              return (
                <motion.button
                  key={theme.name}
                  onClick={() => {
                    setTheme(theme);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'relative p-3 rounded-lg border-2 transition-all',
                    'hover:scale-105 active:scale-95',
                    isActive
                      ? 'border-primary shadow-lg'
                      : 'border-border hover:border-primary/50'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.secondary}))`,
                        }}
                      />
                      <span className="text-sm font-medium text-foreground flex-1 text-left">
                        {theme.name}
                      </span>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-primary"
                        >
                          <Check className="w-4 h-4" />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="flex-1 h-2 rounded-full"
                        style={{ backgroundColor: `hsl(${theme.primary})` }}
                      />
                      <div
                        className="flex-1 h-2 rounded-full"
                        style={{ backgroundColor: `hsl(${theme.secondary})` }}
                      />
                      <div
                        className="flex-1 h-2 rounded-full"
                        style={{ backgroundColor: `hsl(${theme.accent})` }}
                      />
                    </div>
                  </div>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layoutId="activeTheme"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
    </TooltipProvider>
  );
}


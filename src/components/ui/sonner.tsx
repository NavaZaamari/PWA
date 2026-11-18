import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "!bg-olive-dark !text-cream !border-olive !shadow-lift !rounded-2xl !font-sans [&_[data-icon]]:!text-sage",
          title: "!text-cream !font-semibold",
          description: "!text-cream/80",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-straw !text-night",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

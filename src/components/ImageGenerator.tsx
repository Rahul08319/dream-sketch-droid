import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: prompt.trim() }
      });

      if (error) {
        if (error.message.includes('Rate limit')) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (error.message.includes('Payment required')) {
          toast.error("Credits exhausted. Please add credits to continue.");
        } else {
          toast.error("Failed to generate image. Please try again.");
        }
        console.error('Error:', error);
        return;
      }

      if (data?.image) {
        setGeneratedImage(data.image);
        toast.success("Image generated successfully!");
      } else {
        toast.error("No image returned from the server");
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    link.click();
    toast.success("Image downloaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Powered by Gemini AI</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            AI Image Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Transform your ideas into stunning images with AI
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Describe the image you want to generate... (e.g., 'A futuristic city at sunset with flying cars')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary transition-all text-base"
              disabled={isGenerating}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
              {prompt.length} characters
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            variant="gradient"
            size="lg"
            className="w-full text-base font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Image
              </>
            )}
          </Button>
        </div>

        {/* Generated Image Display */}
        {generatedImage && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative group overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-2">
              <img
                src={generatedImage}
                alt="Generated artwork"
                className="w-full h-auto rounded-xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  size="lg"
                  className="backdrop-blur-sm"
                >
                  <Download className="w-5 h-5" />
                  Download Image
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
      </div>
    </div>
  );
};

export default ImageGenerator;

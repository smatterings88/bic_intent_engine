import {
  buildArticleBreadcrumbJsonLd,
  buildArticleFaqJsonLd,
  buildArticleJsonLd,
} from "@/lib/articles/schema";
import type { Article } from "@/types/article";
import type { RotatingArticleLinkResult } from "@/types/internal-links";
import { AnswerBlock } from "./AnswerBlock";
import { ArticleBody } from "./ArticleBody";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleLeadMagnetBlock } from "./ArticleLeadMagnetBlock";
import { FAQBlock } from "./FAQBlock";
import { JsonLdScript } from "./JsonLdScript";
import { RelatedArticlesBlock } from "./RelatedArticlesBlock";

export function ArticleTemplate({
  article,
  rotatingLinks,
}: {
  article: Article;
  rotatingLinks?: RotatingArticleLinkResult;
}) {
  const faqLd = buildArticleFaqJsonLd(article);
  return (
    <article className="pb-24">
      <JsonLdScript data={buildArticleJsonLd(article)} />
      <JsonLdScript data={buildArticleBreadcrumbJsonLd(article)} />
      {faqLd ? <JsonLdScript data={faqLd} /> : null}
      <ArticleHeader article={article} />
      <AnswerBlock text={article.aeo.answerBlock} />
      <ArticleBody article={article} />
      <FAQBlock faqs={article.aeo.faqs} />
      <ArticleLeadMagnetBlock leadMagnetId={article.leadMagnetId} />
      <RelatedArticlesBlock
        rotatingLinks={rotatingLinks}
        slugs={article.relatedArticleSlugs}
        currentSlug={article.slug}
        slugFallbackLimit={article.internalLinking.maxLinks}
      />
    </article>
  );
}

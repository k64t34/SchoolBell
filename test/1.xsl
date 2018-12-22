<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output  method = "html"/>
<xsl:template match="/">
	<html><body><H1>Title</H1>
	<xsl:for-each select="/Timetable/Day">    
	<!--<xsl:sort select="@Lesson" order="descending"/>-->
		<xsl:value-of select="@id" />
		<xsl:text>,</xsl:text>
    </xsl:for-each>
	</body></html>
</xsl:template>
</xsl:stylesheet>

 
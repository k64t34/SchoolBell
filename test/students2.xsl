<?xml version = "1.0" encoding = "UTF-8"?> 
   <xsl:stylesheet version = "1.0" 
      xmlns:xsl = "http://www.w3.org/1999/XSL/Transform">
	  
<xsl:output  method = "text"/>	  
   <xsl:template match = "/"> 
			   <xsl:for-each select = "Timetable/Day[@id='2']/Lesson"> 			   
			   <xsl:sort select="@id" order="ascending"/>
                  <tr> 
                     <td><xsl:value-of select = "@id"/></td> 
                     <td><xsl:value-of select = "@subject"/></td> 
               </xsl:for-each> 
					
   </xsl:template>  
</xsl:stylesheet>
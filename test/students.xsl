<?xml version = "1.0" encoding = "UTF-8"?> 
<xsl:stylesheet version = "1.0" xmlns:xsl = "http://www.w3.org/1999/XSL/Transform">
<xsl:output method="text"/>
   <xsl:template match = "/"> 
    
           
			   <xsl:for-each select = "Timetable/Day/Lesson"> 			   
			   <xsl:sort select="@id" order="ascending"/>              
                     
					 <xsl:variable name="IdSubect" select="@subject"/>
					 <xsl:value-of select = "document('subjects.xml')/Timetable/subjects/subject[@id=$IdSubect]"/>              
                   
               </xsl:for-each> 
					
            
         
   </xsl:template>  
</xsl:stylesheet>


<!--
<?xml version = "1.0" encoding = "UTF-8"?> 
   <xsl:stylesheet version = "1.0" 
      xmlns:xsl = "http://www.w3.org/1999/XSL/Transform">
   <xsl:template match = "/"> 
      <html> 
         <body> 
            <h2>Students</h2> 
            <table border = "1"> 
               <tr bgcolor = "#9acd32"> 
                  <th>Roll No</th> 
                  <th>First Name</th> 
                  <th>Last Name</th> 
                  <th>Nick Name</th> 
                  <th>Marks</th> 
               </tr> 			
               
			   <xsl:for-each select = "Timetable/Day/Lesson"> 			   
			   <xsl:sort select="@id" order="ascending"/>
                  <tr> 
                     <td><xsl:value-of select = "@id"/></td> 
					 <xsl:variable name="IdSubect" select="@subject"/>
                     <td><xsl:value-of select = "@subject"/></td> 
					 <td><xsl:value-of select = "$IdSubect"/></td> 
					 <td><xsl:value-of select = "current()"/></td> 					 
					 <td><xsl:value-of select = "document('subjects.xml')/Timetable/subjects/subject[@id=$IdSubect]"/> </td>                      
                  </tr> 
               </xsl:for-each> 
					
            </table> 
         </body> 
      </html> 
   </xsl:template>  
</xsl:stylesheet>-->
import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak

# ---------------------------------------------------------
# Step 1: Draw Visual UML Class Diagram using Matplotlib
# ---------------------------------------------------------
fig, ax = plt.subplots(figsize=(16, 20), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 120)
ax.axis('off')
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

# Title
ax.text(50, 116, "TrafficEase BD — System UML Class Diagram", fontsize=20, fontweight='bold', ha='center', color='#38bdf8')
ax.text(50, 113.5, "BRAC University | CSE 470: Software Engineering Project Architecture", fontsize=11, ha='center', color='#94a3b8')

def draw_class_box(ax, x, y, w, h, title, stereotype="", attributes=[], methods=[], fill_color='#1e293b', border_color='#38bdf8'):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.3,rounding_size=0.8", 
                                  linewidth=1.8, edgecolor=border_color, facecolor=fill_color, zorder=2)
    ax.add_patch(rect)
    
    title_y = y + h - 1.8
    if stereotype:
        ax.text(x + w/2, title_y + 0.8, f"<<{stereotype}>>", fontsize=7.5, fontstyle='italic', ha='center', color='#94a3b8', zorder=3)
    ax.text(x + w/2, title_y - 0.2, title, fontsize=9.5, fontweight='bold', ha='center', color='#f8fafc', zorder=3)
    
    div1_y = y + h - (3.2 if stereotype else 2.5)
    ax.plot([x, x + w], [div1_y, div1_y], color=border_color, linewidth=1.0, zorder=3)
    
    curr_y = div1_y - 1.2
    for attr in attributes:
        ax.text(x + 0.6, curr_y, attr, fontsize=7.2, ha='left', va='center', color='#cbd5e1', fontfamily='monospace', zorder=3)
        curr_y -= 1.15
        
    div2_y = curr_y - 0.3
    ax.plot([x, x + w], [div2_y, div2_y], color=border_color, linewidth=0.8, linestyle='--', zorder=3)
    
    curr_y = div2_y - 1.2
    for method in methods:
        ax.text(x + 0.6, curr_y, method, fontsize=7.0, ha='left', va='center', color='#e2e8f0', fontfamily='monospace', zorder=3)
        curr_y -= 1.15

# Class Data Definitions
# 1. Base User (Abstract)
draw_class_box(ax, 38, 92, 24, 17, "User", stereotype="Abstract Base",
               attributes=["- userId: String", "- name: String", "- email: String", "- phone: String", "- role: UserRoleEnum", "- createdAt: Date"],
               methods=["+ register(): Boolean", "+ login(): AuthToken", "+ updateProfile(): Void", "+ comparePassword(): Bool"],
               fill_color='#1e293b', border_color='#38bdf8')

# 2. Subclasses of User (Inheritance)
draw_class_box(ax, 3, 70, 20, 15, "Commuter", stereotype="Entity Subclass",
               attributes=["- preferredRoutes: List", "- savedLocations: List"],
               methods=["+ planBypassRoute()", "+ reportHazard()", "+ requestCngFare()", "+ trackBus()"],
               fill_color='#0f2942', border_color='#60a5fa')

draw_class_box(ax, 26, 70, 21, 15, "Driver", stereotype="Entity Subclass",
               attributes=["- licenseNo: String", "- vehicleId: String", "- routeAssigned: String"],
               methods=["+ updateLiveLocation()", "+ changeVehicleStatus()"],
               fill_color='#0f2942', border_color='#60a5fa')

draw_class_box(ax, 50, 70, 22, 15, "Authority", stereotype="Entity Subclass",
               attributes=["- agencyName: String", "- badgeId: String", "- department: String"],
               methods=["+ verifyIncident()", "+ assignOfficer()", "+ broadcastAlert()", "+ toggleVipProtocol()"],
               fill_color='#0f2942', border_color='#60a5fa')

draw_class_box(ax, 75, 70, 22, 15, "Admin", stereotype="Entity Subclass",
               attributes=["- accessLevel: String", "- adminPermissions: List"],
               methods=["+ manageUsers()", "+ auditSystemLogs()", "+ configureSignals()"],
               fill_color='#0f2942', border_color='#60a5fa')

# 3. Incident
draw_class_box(ax, 5, 42, 24, 18, "Incident", stereotype="Entity Class",
               attributes=["- incidentId: String", "- title: String", "- type: IncidentTypeEnum", "- severity: SeverityEnum", "- status: IncidentStatusEnum", "- locationName: String", "- coordinates: [Lat, Lng]", "- reportedBy: UserReference"],
               methods=["+ createIncident(): Boolean", "+ updateStatus(): Void", "+ assignAuthority(): Void", "+ getProximityJam()"],
               fill_color='#2d1520', border_color='#f43f5e')

# 4. Vehicle
draw_class_box(ax, 36, 42, 26, 18, "Vehicle", stereotype="Base Entity",
               attributes=["- vehicleId: String", "- vehicleNumber: String", "- type: VehicleTypeEnum", "- currentLocation: [Lat,Lng]", "- status: VehicleStatusEnum", "- driverId: UserReference", "- lastUpdated: Timestamp"],
               methods=["+ updateLocation(): Void", "+ getNearbyVehicles(): List", "+ toggleEmergencySiren()"],
               fill_color='#1c261e', border_color='#34d399')

# 5. Specialized Vehicles (Inheritance)
draw_class_box(ax, 34, 18, 14, 12, "PublicBus", stereotype="Subclass",
               attributes=["- routeName: String", "- passengerCap: Int"],
               methods=["+ updateGpsFeed()"], fill_color='#113023', border_color='#10b981')

draw_class_box(ax, 50, 18, 15, 12, "EmergencyAmbulance", stereotype="Subclass",
               attributes=["- sirenActive: Bool", "- hospitalTarget: String"],
               methods=["+ triggerPriorityWave()"], fill_color='#361217', border_color='#ef4444')

# 6. RoutePlanner (Service Controller)
draw_class_box(ax, 68, 42, 28, 19, "RoutePlanner", stereotype="Service Controller",
               attributes=["- originCoords: [Lat,Lng]", "- destCoords: [Lat,Lng]", "- vehicleClass: String", "- vipProtocolActive: Boolean", "- monsoonBypassActive: Boolean", "- bazaarBlockActive: Boolean"],
               methods=["+ fetchOSRMRoute(): List", "+ calculateCongestionIndex()", "+ evaluateDetours(): List", "+ calculateTollSum(): Float"],
               fill_color='#251838', border_color='#c084fc')

# 7. BypassRoute (Entity)
draw_class_box(ax, 70, 15, 26, 18, "BypassRoute", stereotype="Entity Class",
               attributes=["- routeId: String", "- geometry: List<Coord>", "- distanceKm: Float", "- durationMin: Int", "- congestionScore: Int", "- tollFee: Float", "- detoursApplied: List"],
               methods=["+ getRouteSummary(): String", "+ formatTurnInstructions()"],
               fill_color='#251838', border_color='#a855f7')

# 8. RouteStep (Composition part of BypassRoute)
draw_class_box(ax, 72, 0.5, 22, 10, "RouteStep", stereotype="Composition Part",
               attributes=["- instruction: String", "- distanceMeters: Int", "- durationSec: Int", "- directionIcon: String"],
               methods=["+ getFormattedStep(): String"], fill_color='#1a1026', border_color='#8b5cf6')

# 9. Alert
draw_class_box(ax, 3, 16, 23, 14, "Alert", stereotype="Entity Class",
               attributes=["- alertId: String", "- title: String", "- message: String", "- area: String", "- severity: AlertSeverityEnum", "- active: Boolean", "- expiresAt: Date"],
               methods=["+ publishAlert(): Void", "+ deactivateAlert(): Void"],
               fill_color='#262010', border_color='#fbbf24')

# 10. TransitRoute
draw_class_box(ax, 38, 0.5, 26, 11, "TransitRoute", stereotype="Entity Class",
               attributes=["- name: String", "- mode: String", "- origin: String", "- destination: String", "- schedule: String", "- fare: Float"],
               methods=["+ getLiveBusPositions(): List"], fill_color='#1e293b', border_color='#94a3b8')

# Helper to draw connectors
def draw_arrow(ax, p1, p2, label="", style="assoc", color="#94a3b8"):
    x1, y1 = p1
    x2, y2 = p2
    if style == "inher":
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>", lw=1.8, mutation_scale=15, facecolor='#0f172a', edgecolor=color))
    elif style == "comp":
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-", lw=1.8, color=color))
        diamond = patches.RegularPolygon((x1, y1), 4, radius=1.0, orientation=0, facecolor=color, edgecolor=color, zorder=5)
        ax.add_patch(diamond)
    elif style == "agg":
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-", lw=1.8, color=color))
        diamond = patches.RegularPolygon((x1, y1), 4, radius=1.0, orientation=0, facecolor='#0f172a', edgecolor=color, lw=1.5, zorder=5)
        ax.add_patch(diamond)
    else:
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", lw=1.5, mutation_scale=12, color=color))
    
    if label:
        mid_x = (x1 + x2) / 2
        mid_y = (y1 + y2) / 2
        ax.text(mid_x, mid_y + 0.8, label, fontsize=7.0, color='#cbd5e1', ha='center', bbox=dict(boxstyle="round,pad=0.2", fc='#0f172a', ec='none', alpha=0.8), zorder=6)

# Draw Relationship Lines
draw_arrow(ax, (13, 85), (50, 92), style="inher", color="#60a5fa")
draw_arrow(ax, (36, 85), (50, 92), style="inher", color="#60a5fa")
draw_arrow(ax, (61, 85), (50, 92), style="inher", color="#60a5fa")
draw_arrow(ax, (86, 85), (50, 92), style="inher", color="#60a5fa")

draw_arrow(ax, (41, 30), (49, 42), style="inher", color="#34d399")
draw_arrow(ax, (57, 30), (49, 42), style="inher", color="#34d399")

draw_arrow(ax, (13, 70), (15, 60), label="reports (1 to 0..*)", style="assoc", color="#f43f5e")
draw_arrow(ax, (58, 70), (27, 60), label="verifies / resolves (1 to 0..*)", style="assoc", color="#f43f5e")
draw_arrow(ax, (55, 70), (18, 30), label="broadcasts (1 to 0..*)", style="assoc", color="#fbbf24")
draw_arrow(ax, (37, 70), (45, 60), label="operates (1 to 0..1)", style="assoc", color="#34d399")

draw_arrow(ax, (68, 52), (29, 52), label="evaluates (0..*)", style="agg", color="#c084fc")
draw_arrow(ax, (82, 42), (83, 33), label="generates (1 to 1..*)", style="assoc", color="#a855f7")
draw_arrow(ax, (83, 15), (83, 10.5), label="contains (1 to 1..*)", style="comp", color="#8b5cf6")
draw_arrow(ax, (48, 11.5), (41, 18), label="runs (0..*)", style="agg", color="#94a3b8")

# Legend Box
legend_x, legend_y = 3, 0.5
legend_rect = patches.FancyBboxPatch((legend_x, legend_y), 32, 12, boxstyle="round,pad=0.3", fc='#1e293b', ec='#475569', lw=1.2)
ax.add_patch(legend_rect)
ax.text(legend_x + 16, legend_y + 10.5, "UML Relationship Notation Key", fontsize=8.5, fontweight='bold', color='#f8fafc', ha='center')

ax.plot([legend_x + 2, legend_x + 6], [legend_y + 8, legend_y + 8], color='#60a5fa', lw=1.5)
ax.text(legend_x + 7, legend_y + 8, "Inheritance (Generalization)", fontsize=7.2, color='#cbd5e1', va='center')

ax.plot([legend_x + 2, legend_x + 6], [legend_y + 5.5, legend_y + 5.5], color='#8b5cf6', lw=1.5)
diamond1 = patches.RegularPolygon((legend_x + 2, legend_y + 5.5), 4, radius=0.8, facecolor='#8b5cf6', edgecolor='#8b5cf6')
ax.add_patch(diamond1)
ax.text(legend_x + 7, legend_y + 5.5, "Composition (Strong Ownership)", fontsize=7.2, color='#cbd5e1', va='center')

ax.plot([legend_x + 2, legend_x + 6], [legend_y + 3, legend_y + 3], color='#c084fc', lw=1.5)
diamond2 = patches.RegularPolygon((legend_x + 2, legend_y + 3), 4, radius=0.8, facecolor='#0f172a', edgecolor='#c084fc', lw=1.2)
ax.add_patch(diamond2)
ax.text(legend_x + 7, legend_y + 3, "Aggregation (Weak Ownership)", fontsize=7.2, color='#cbd5e1', va='center')

ax.annotate('', xy=(legend_x + 6, legend_y + 0.8), xytext=(legend_x + 2, legend_y + 0.8), arrowprops=dict(arrowstyle="->", lw=1.5, color='#f43f5e'))
ax.text(legend_x + 7, legend_y + 0.8, "Association (Multiplicity)", fontsize=7.2, color='#cbd5e1', va='center')

plt.tight_layout()
image_path = "d:/TrafficEase_BD_Redesigned/class_diagram_visual.png"
plt.savefig(image_path, bbox_inches='tight', dpi=300)
plt.close()
print("Saved diagram visual png at:", image_path)

# ---------------------------------------------------------
# Step 2: Build Print-Ready Formal PDF Solution Document
# ---------------------------------------------------------
pdf_path = "d:/TrafficEase_BD_Redesigned/CSE470_Project_Class_Diagram.pdf"
doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
styles = getSampleStyleSheet()

title_style = ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.HexColor('#1e3a8a'), alignment=1)
subtitle_style = ParagraphStyle('DocSubTitle', parent=styles['Normal'], fontName='Helvetica', fontSize=10.5, leading=13, textColor=colors.HexColor('#475569'), alignment=1)
h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=13, leading=16, textColor=colors.HexColor('#1e293b'), spaceBefore=12, spaceAfter=6)
body_style = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor('#334155'), spaceAfter=5)
table_text = ParagraphStyle('TableText', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=9.5, textColor=colors.HexColor('#1e293b'))
table_header = ParagraphStyle('TableHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.white)

story = []

story.append(Paragraph("BRAC University — Department of Computer Science & Engineering", subtitle_style))
story.append(Paragraph("CSE 470: Software Engineering Project Solution", title_style))
story.append(Spacer(1, 4))
story.append(Paragraph("<b>Assignment Topic:</b> System UML Class Diagram & Object-Oriented Architecture Specification", subtitle_style))
story.append(Paragraph("<b>Project Title:</b> TrafficEase BD — Smart Urban Traffic Management & Commuter Bypass Navigation Platform", subtitle_style))
story.append(Spacer(1, 8))

q_data = [[Paragraph("<b>Assignment Question:</b><br/>Design a Class Diagram for your CSE 470 Project system.<br/><b>Instructions:</b><br/>• Identify key classes<br/>• Define relevant attributes<br/>• Define operations/methods<br/>• Clearly represent relationships: Associations, Inheritance, Aggregation or Composition where applicable.", body_style)]]
q_table = Table(q_data, colWidths=[540])
q_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
    ('PADDING', (0,0), (-1,-1), 6),
]))
story.append(q_table)
story.append(Spacer(1, 10))

story.append(Paragraph("1. System Architecture & Class Overview", h1_style))
story.append(Paragraph("The <b>TrafficEase BD</b> platform provides real-time traffic monitoring, incident verification, and intelligent bypass route planning for Dhaka commuters. The object-oriented architecture is divided into three functional packages: <b>User & Identity Management</b>, <b>Incident & Asset Management</b>, and the <b>Smart Bypass Navigation Engine</b>.", body_style))

story.append(Paragraph("2. Visual UML Class Diagram", h1_style))
story.append(Paragraph("The diagram below illustrates all primary entities, methods, visibility scope (<code>+</code> public, <code>-</code> private), and explicit UML relationships.", body_style))
story.append(Spacer(1, 4))
img = Image(image_path, width=540, height=675)
story.append(img)
story.append(PageBreak())

story.append(Paragraph("3. Detailed Key Class Specifications", h1_style))

classes_data = [
    [Paragraph("<b>Class Name & Stereotype</b>", table_header), Paragraph("<b>Attributes (Name: Type)</b>", table_header), Paragraph("<b>Operations / Methods</b>", table_header), Paragraph("<b>Description / Role</b>", table_header)],
    
    [Paragraph("<b>User</b><br/>«Abstract Base»", table_text), 
     Paragraph("- userId: String<br/>- name: String<br/>- email: String<br/>- phone: String<br/>- role: UserRoleEnum<br/>- createdAt: Date", table_text),
     Paragraph("+ register(): Boolean<br/>+ login(): AuthToken<br/>+ updateProfile(): Void<br/>+ comparePassword(): Bool", table_text),
     Paragraph("Abstract superclass encapsulating core user identity, credentials, and authentication logic.", table_text)],

    [Paragraph("<b>Commuter</b><br/>«User Subclass»", table_text), 
     Paragraph("- preferredRoutes: List<br/>- savedLocations: List", table_text),
     Paragraph("+ planBypassRoute()<br/>+ reportHazard()<br/>+ requestCngFare()<br/>+ trackBus()", table_text),
     Paragraph("General public commuter using route navigation, fare estimation, and crowdsourced reporting.", table_text)],

    [Paragraph("<b>Authority</b><br/>«User Subclass»", table_text), 
     Paragraph("- agencyName: String<br/>- badgeId: String<br/>- department: String", table_text),
     Paragraph("+ verifyIncident()<br/>+ assignOfficer()<br/>+ broadcastAlert()<br/>+ toggleVipProtocol()", table_text),
     Paragraph("Traffic police or municipal authority responsible for verifying incidents and issuing alerts.", table_text)],

    [Paragraph("<b>Driver</b><br/>«User Subclass»", table_text), 
     Paragraph("- licenseNo: String<br/>- vehicleId: String<br/>- routeAssigned: String", table_text),
     Paragraph("+ updateLiveLocation()<br/>+ changeVehicleStatus()", table_text),
     Paragraph("Transit driver transmitting real-time GPS telemetry feeds.", table_text)],

    [Paragraph("<b>Incident</b><br/>«Domain Entity»", table_text), 
     Paragraph("- incidentId: String<br/>- title: String<br/>- type: IncidentTypeEnum<br/>- severity: SeverityEnum<br/>- status: IncidentStatusEnum<br/>- coordinates: [Lat,Lng]", table_text),
     Paragraph("+ createIncident()<br/>+ updateStatus()<br/>+ assignAuthority()<br/>+ getProximityJam()", table_text),
     Paragraph("Core entity representing accidents, roadworks, waterlogging, or congestion points.", table_text)],

    [Paragraph("<b>Vehicle</b><br/>«Base Entity»", table_text), 
     Paragraph("- vehicleId: String<br/>- vehicleNumber: String<br/>- type: VehicleTypeEnum<br/>- currentLocation: [Lat,Lng]<br/>- status: StatusEnum", table_text),
     Paragraph("+ updateLocation()<br/>+ getNearbyVehicles()<br/>+ toggleEmergencySiren()", table_text),
     Paragraph("Represents fleet units active on the road (buses, CNGs, emergency vehicles).", table_text)],

    [Paragraph("<b>RoutePlanner</b><br/>«Service Controller»", table_text), 
     Paragraph("- originCoords: [Lat,Lng]<br/>- destCoords: [Lat,Lng]<br/>- vehicleClass: String<br/>- vipProtocolActive: Bool<br/>- monsoonBypassActive: Bool", table_text),
     Paragraph("+ fetchOSRMRoute()<br/>+ calculateCongestionIndex()<br/>+ evaluateDetours()<br/>+ calculateTollSum()", table_text),
     Paragraph("Control class coordinating route calculations, OSRM queries, and dynamic detour insertions.", table_text)],

    [Paragraph("<b>BypassRoute</b><br/>«Domain Entity»", table_text), 
     Paragraph("- routeId: String<br/>- geometry: List<Coord><br/>- distanceKm: Float<br/>- durationMin: Int<br/>- congestionScore: Int<br/>- tollFee: Float", table_text),
     Paragraph("+ getRouteSummary()<br/>+ formatTurnInstructions()<br/>+ calculateTollSum()", table_text),
     Paragraph("Represents calculated path output containing geometry, jam load, and step instructions.", table_text)],

    [Paragraph("<b>RouteStep</b><br/>«Part Class»", table_text), 
     Paragraph("- instruction: String<br/>- distanceMeters: Int<br/>- durationSec: Int<br/>- directionIcon: String", table_text),
     Paragraph("+ getFormattedStep(): String", table_text),
     Paragraph("Granular turn-by-turn driving maneuver step belonging directly to a BypassRoute.", table_text)],

    [Paragraph("<b>Alert</b><br/>«Domain Entity»", table_text), 
     Paragraph("- alertId: String<br/>- title: String<br/>- message: String<br/>- area: String<br/>- severity: AlertSeverityEnum", table_text),
     Paragraph("+ publishAlert()<br/>+ deactivateAlert()", table_text),
     Paragraph("Broadcast alert message distributed to commuters in targeted congested zones.", table_text)],

    [Paragraph("<b>TransitRoute</b><br/>«Domain Entity»", table_text), 
     Paragraph("- name: String<br/>- mode: String<br/>- origin: String<br/>- destination: String<br/>- schedule: String<br/>- fare: Float", table_text),
     Paragraph("+ getLiveBusPositions()", table_text),
     Paragraph("Defines public transit line corridors (e.g., Raida Bus, Metro Line 6).", table_text)]
]

tbl = Table(classes_data, colWidths=[90, 150, 150, 150])
tbl.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e3a8a')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
    ('PADDING', (0,0), (-1,-1), 4),
]))

story.append(tbl)
story.append(Spacer(1, 10))

story.append(Paragraph("4. Object-Oriented Relationships & Specifications", h1_style))

rel_data = [
    [Paragraph("<b>Relationship Type</b>", table_header), Paragraph("<b>Source Class</b>", table_header), Paragraph("<b>Target Class</b>", table_header), Paragraph("<b>Multiplicity & Explanation</b>", table_header)],
    
    [Paragraph("<b>Inheritance</b><br/>(Generalization)", table_text), Paragraph("Commuter, Driver, Authority, Admin", table_text), Paragraph("User", table_text),
     Paragraph("Subclasses inherit base user credentials and authentication methods, extending role-specific behaviors.", table_text)],

    [Paragraph("<b>Inheritance</b><br/>(Generalization)", table_text), Paragraph("PublicBus, EmergencyAmbulance", table_text), Paragraph("Vehicle", table_text),
     Paragraph("Subclasses specialize base Vehicle attributes with transit route names or emergency siren triggers.", table_text)],

    [Paragraph("<b>Composition</b><br/>(Strong Part-Whole)", table_text), Paragraph("BypassRoute", table_text), Paragraph("RouteStep", table_text),
     Paragraph("<b>1 to 1..*</b>. RouteStep objects are created as integral components of a BypassRoute. If BypassRoute is destroyed, its steps cease to exist.", table_text)],

    [Paragraph("<b>Composition</b><br/>(Strong Part-Whole)", table_text), Paragraph("TransitRoute", table_text), Paragraph("TransitStop", table_text),
     Paragraph("<b>1 to 1..*</b>. Stops form the structural path sequence of a TransitRoute. Stop lifecycle is bound to the route container.", table_text)],

    [Paragraph("<b>Aggregation</b><br/>(Weak Part-Whole)", table_text), Paragraph("RoutePlanner", table_text), Paragraph("Incident", table_text),
     Paragraph("<b>1 to 0..*</b>. RoutePlanner references active Incidents to calculate proximity detours, but Incidents exist independently in the system database.", table_text)],

    [Paragraph("<b>Aggregation</b><br/>(Weak Part-Whole)", table_text), Paragraph("TransitRoute", table_text), Paragraph("Vehicle", table_text),
     Paragraph("<b>1 to 0..*</b>. PublicBus vehicles operate along a TransitRoute corridor, but vehicles can be reassigned without destroying the TransitRoute.", table_text)],

    [Paragraph("<b>Association</b><br/>(Bi-directional / Direct)", table_text), Paragraph("Commuter", table_text), Paragraph("Incident", table_text),
     Paragraph("<b>1 to 0..*</b>. Commuters create and submit incident reports (crowdsourced pothole/flooding pins).", table_text)],

    [Paragraph("<b>Association</b><br/>(Direct)", table_text), Paragraph("Authority", table_text), Paragraph("Incident", table_text),
     Paragraph("<b>1 to 0..*</b>. Traffic Authorities review, verify, assign officers, and change incident resolution status.", table_text)],

    [Paragraph("<b>Association</b><br/>(Direct)", table_text), Paragraph("Authority", table_text), Paragraph("Alert", table_text),
     Paragraph("<b>1 to 0..*</b>. Authority users broadcast emergency traffic warning alerts to active commuters.", table_text)],

    [Paragraph("<b>Association</b><br/>(Direct)", table_text), Paragraph("RoutePlanner", table_text), Paragraph("BypassRoute", table_text),
     Paragraph("<b>1 to 1..*</b>. RoutePlanner generates calculated BypassRoute instances for commuter selection.", table_text)]
]

rel_tbl = Table(rel_data, colWidths=[100, 110, 110, 220])
rel_tbl.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f766e')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
    ('PADDING', (0,0), (-1,-1), 4),
]))

story.append(rel_tbl)
story.append(Spacer(1, 10))

story.append(Paragraph("5. Architectural Justifications & Mongoose ODM Mapping", h1_style))
story.append(Paragraph("• <b>Mongoose Schema Mapping:</b> In our Node.js/Express backend (<code>backend/models/</code>), persistent entities such as <code>User</code>, <code>Incident</code>, <code>Vehicle</code>, <code>Alert</code>, and <code>TransitRoute</code> translate directly to MongoDB collection schemas with 2DSphere geospatial indices.", body_style))
story.append(Paragraph("• <b>Service & Controller Separation:</b> The <code>RoutePlanner</code> class functions as a pure controller/service, executing OSRM routing requests, evaluating spatial proximity using distance formulae, and dynamically injecting bypass waypoints for VIP protocol blocks or waterlogged streets.", body_style))
story.append(Paragraph("• <b>Encapsulation & Security:</b> Passwords in <code>User</code> are hashed using <code>bcryptjs</code> via pre-save hooks, ensuring credential fields remain private and protected behind authorization middlewares.", body_style))

doc.build(story)
print("PDF Solution generated successfully at:", pdf_path)
